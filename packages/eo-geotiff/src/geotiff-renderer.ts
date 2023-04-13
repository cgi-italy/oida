import LruCache from 'lru-cache';
import { plot } from 'plotty';
import { fromArrayBuffer, Pool, GeoTIFFImage } from 'geotiff';
import proj4 from 'proj4';
import axios, { AxiosRequestConfig } from 'axios';

import { AxiosInstanceWithCancellation, EpsgIoDefinitionProvider } from '@oidajs/core';
import { PlottyRenderer } from './plotty-renderer';

export type GeotiffRendererConfig = {
    cache?: LruCache<string, ArrayBuffer | null>;
    plottyInstance?: plot;
    axiosInstace?: AxiosInstanceWithCancellation;
    onNewSrsRegistration?: (srs: string) => void;
};

export type GeotiffUrlRequestParams = {
    url: string;
    postData?: any;
    disableCache?: boolean;
    retryCount?: number;
};

export type GeotiffRenderFromUrlParams = GeotiffUrlRequestParams & {
    outputExtent?: number[];
    outputSrs?: string;
};

export type GeotiffRenderFromBufferParams = {
    data: ArrayBuffer;
    outputExtent?: number[];
    outputSrs?: string;
};

export type GeotiffRendererData = {
    values: ArrayBuffer;
    width: number;
    height: number;
    noData?: number;
    imageExtent: number[];
    outputExtent?: number[];
    flipY?: boolean;
};

export type GeotiffRenderRequestResponse = {
    imageData: string;
    newSrsDefinition: boolean;
};

export class GeotiffRenderer {
    /**
     * Set a decoder (pool) to use for geotiff deconding.
     * See {@link https://github.com/geotiffjs/geotiff.js/#using-decoder-pools-to-improve-parsing-performance | geotiffjs documentation}
     * @param decoder
     */
    static setDecoder(decoder: Pool) {
        this.decoder_ = decoder;
    }

    protected static srsDefProvider_ = new EpsgIoDefinitionProvider();
    protected static defaultCacheInstance_: LruCache<string, ArrayBuffer | null> | undefined;
    protected static decoder_: Pool | undefined = undefined;

    /**
     * Canvas used for post rendering transformations (e.g. extent scaling)
     *
     * @protected
     * @static
     * @type {(HTMLCanvasElement | undefined)}
     * @memberof GeotiffRenderer
     */
    protected static transformCanvas_: HTMLCanvasElement | undefined;
    protected static transformContext_: CanvasRenderingContext2D | undefined;

    protected static getDefaultCacheInstance_() {
        if (!GeotiffRenderer.defaultCacheInstance_) {
            GeotiffRenderer.defaultCacheInstance_ = new LruCache({
                maxSize: 1e8,
                sizeCalculation: (item, key) => {
                    return item ? item.byteLength : 1;
                }
            });
        }
        return GeotiffRenderer.defaultCacheInstance_;
    }

    protected static getTransformCanvas_(): [HTMLCanvasElement, CanvasRenderingContext2D] {
        if (!GeotiffRenderer.transformCanvas_) {
            GeotiffRenderer.transformCanvas_ = document.createElement('canvas');
            const ctx = GeotiffRenderer.transformCanvas_.getContext('2d');
            if (!ctx) {
                throw new Error('GeotiffRenderer: unable to create 2D canvas rendering context');
            }
            GeotiffRenderer.transformContext_ = ctx;
        }
        return [GeotiffRenderer.transformCanvas_, GeotiffRenderer.transformContext_!];
    }

    protected cache_: LruCache<string, ArrayBuffer | null>;
    protected plotty_: PlottyRenderer;
    protected axiosInstance_: AxiosInstanceWithCancellation | undefined;
    protected pendingRequests_: Record<string, Promise<ArrayBuffer>>;
    protected srsRegistrationCb_?: (srs: string) => void;

    constructor(config: GeotiffRendererConfig) {
        this.cache_ = config.cache || GeotiffRenderer.getDefaultCacheInstance_();

        this.plotty_ = new PlottyRenderer({
            plottyInstance: config.plottyInstance
        });

        this.axiosInstance_ = config.axiosInstace;
        this.pendingRequests_ = {};
        this.srsRegistrationCb_ = config.onNewSrsRegistration;
    }

    get cache() {
        return this.cache_;
    }

    get plotty() {
        return this.plotty_;
    }

    renderFromUrl(params: GeotiffRenderFromUrlParams): Promise<string> {
        return this.retrieveTiffData_(params).then((data) => {
            return this.renderFromBuffer({
                data: data,
                outputExtent: params.outputExtent,
                outputSrs: params.outputSrs
            });
        });
    }

    renderFromBuffer(params: GeotiffRenderFromBufferParams) {
        return this.renderBuffer_(params).then((canvas) => {
            return canvas.toDataURL();
        });
    }

    extractGeotiffExtentFromUrl(params: GeotiffUrlRequestParams) {
        return this.retrieveTiffData_(params).then((data) => {
            return fromArrayBuffer(data).then((tiff) => {
                return tiff.getImage().then((image) => {
                    return this.getGeotiffExtent_(image);
                });
            });
        });
    }

    protected retrieveTiffData_(params: GeotiffUrlRequestParams): Promise<ArrayBuffer> {
        const dataRequest: AxiosRequestConfig = {
            url: params.url,
            method: params.postData ? 'POST' : 'GET',
            data: params.postData,
            responseType: 'arraybuffer'
        };

        let requestHandler = axios.request;
        if (this.axiosInstance_) {
            requestHandler = this.axiosInstance_.cancelableRequest;
        }

        if (!params.disableCache) {
            const cachedData = this.cache_.get(params.url);
            if (cachedData !== undefined) {
                return cachedData === null ? Promise.reject(new Error('Unable to retrieve data')) : Promise.resolve(cachedData);
            }
        }

        const pendingRequest = this.pendingRequests_[params.url];
        if (pendingRequest !== undefined) {
            return pendingRequest;
        }

        const request = requestHandler<ArrayBuffer>(dataRequest)
            .then((response) => {
                delete this.pendingRequests_[params.url];

                if (!params.disableCache) {
                    this.cache_.set(params.url, response.data);
                }

                return response.data;
            })
            .catch((error) => {
                delete this.pendingRequests_[params.url];

                if (params.retryCount) {
                    return this.retrieveTiffData_({
                        ...params,
                        retryCount: params.retryCount - 1
                    });
                }
                if (!params.disableCache) {
                    this.cache_.set(params.url, null);
                }

                throw error;
            });

        this.pendingRequests_[params.url] = request;

        return request;
    }

    protected renderBuffer_(params: GeotiffRenderFromBufferParams): Promise<HTMLCanvasElement> {
        return fromArrayBuffer(params.data).then((tiff) => {
            return tiff.getImage().then((image) => {
                return image.readRasters({ pool: GeotiffRenderer.decoder_ }).then((data) => {
                    let noData: number | undefined;
                    const gdalNoData = image.getFileDirectory().GDAL_NODATA;
                    if (gdalNoData) {
                        noData = parseFloat(gdalNoData);
                    }

                    // when y pixel size is positivie (very uncommon) we need to flip vertically the rendered image
                    const resolution = image.getResolution() || [];

                    return this.getGeotiffExtent_(image, params.outputSrs).then((imageExtent) => {
                        const renderData: GeotiffRendererData = {
                            values: data[0] as ArrayBuffer,
                            width: image.getWidth(),
                            height: image.getHeight(),
                            noData: noData,
                            outputExtent: params.outputExtent,
                            imageExtent: imageExtent.bbox,
                            flipY: resolution[1] > 0
                        };

                        return this.renderTiffImage_(renderData);
                    });
                });
            });
        });
    }

    protected renderTiffImage_(data: GeotiffRendererData) {
        this.plotty_.setNoDataValue(data.noData);
        this.plotty_.setFlipY(data.flipY || false);
        let outputCanvas = this.plotty_.render(data.values, data.width, data.height);
        if (data.outputExtent) {
            outputCanvas = this.warpImage_(outputCanvas, data.imageExtent, data.outputExtent);
        }
        return outputCanvas;
    }

    protected getGeotiffExtent_(image: GeoTIFFImage, outputSrs?: string): Promise<{ srs: string; bbox: number[] }> {
        const imageExtent: number[] = image.getBoundingBox();
        const imageSrs = this.getImageSrs_(image);
        if (imageSrs) {
            return this.registerSrs_(imageSrs).then(() => {
                if (outputSrs && imageSrs !== outputSrs) {
                    return {
                        srs: outputSrs || imageSrs,
                        bbox: this.transformExtent_(imageExtent, imageSrs, outputSrs)
                    };
                } else {
                    return {
                        srs: imageSrs,
                        bbox: imageExtent
                    };
                }
            });
        } else {
            return Promise.resolve({
                bbox: imageExtent,
                srs: 'custom'
            });
        }
    }

    protected transformExtent_(extent: number[], sourceSrs: string, destSrs: string): number[] {
        const ll = proj4(sourceSrs, destSrs, [extent[0], extent[1]]);
        const ur = proj4(sourceSrs, destSrs, [extent[2], extent[3]]);

        return [...ll, ...ur];
    }

    /**
     * Check if the srs code is already registered in proj4 and retrieve it from epsg.io otherwise
     *
     * @protected
     * @param {string} code
     * @returns the srs definition was registered
     * @memberof GeotiffRenderer
     */
    protected registerSrs_(code: string) {
        if (!proj4.defs(code)) {
            return GeotiffRenderer.srsDefProvider_
                .getSrsDefinition(code)
                .then((srsDef) => {
                    proj4.defs(code, srsDef);
                    if (this.srsRegistrationCb_) {
                        this.srsRegistrationCb_(code);
                    }
                })
                .then(() => {
                    return true;
                });
        } else {
            return Promise.resolve(false);
        }
    }

    protected getImageSrs_(image) {
        const imageSrs: number = image.geoKeys?.ProjectedCSTypeGeoKey || image.geoKeys?.GeographicTypeGeoKey;
        if (imageSrs) {
            if (imageSrs < 32767) {
                return `EPSG:${imageSrs}`;
            } else {
                // user defined srs (http://geotiff.maptools.org/spec/geotiff6.html#6.3.3.1)
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    protected warpImage_(sourceCanvas: HTMLCanvasElement, sourceExtent: number[], outputExtent: number[]) {
        const sourceWidth = sourceExtent[2] - sourceExtent[0];
        const sourceHeight = sourceExtent[3] - sourceExtent[1];
        const outputWidth = outputExtent[2] - outputExtent[0];
        const outputHeight = outputExtent[3] - outputExtent[1];
        const eps = 0.001;

        if (outputWidth - sourceWidth > eps || outputHeight - sourceHeight > eps) {
            const dw = (sourceWidth / outputWidth) * sourceCanvas.width;
            const dh = (sourceHeight / outputHeight) * sourceCanvas.height;
            const dx = ((sourceExtent[0] - outputExtent[0]) / outputWidth) * sourceCanvas.width;
            const dy = ((outputExtent[3] - sourceExtent[3]) / outputHeight) * sourceCanvas.height;

            const [outputCanvas, outputContext] = GeotiffRenderer.getTransformCanvas_();
            outputCanvas.width = sourceCanvas.width;
            outputCanvas.height = sourceCanvas.height;

            outputContext.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
            outputContext.drawImage(sourceCanvas, dx, dy, dw, dh);
            return outputCanvas;
        } else {
            return sourceCanvas;
        }
    }
}
