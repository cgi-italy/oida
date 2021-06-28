import LruCache from 'lru-cache';
import { plot } from 'plotty';
import { fromArrayBuffer, Pool } from 'geotiff';
import proj4 from 'proj4';
import axios, { AxiosRequestConfig } from 'axios';

import { AxiosInstanceWithCancellation, EpsgIoDefinitionProvider } from '@oida/core';
import { PlottyRenderer } from './plotty-renderer';

export type GeotiffRendererConfig = {
    cache?: LruCache;
    plottyInstance?: plot;
    axiosInstace?: AxiosInstanceWithCancellation;
};

export type RenderFromUrlParams = {
    url: string;
    postData?: any;
    outputExtent?: number[];
    outputSrs?: string;
    disableCache?: boolean;
    retryCount?: number;
};

export type RenderFromBufferParams = {
    data: ArrayBuffer,
    outputExtent?: number[];
    outputSrs?: string;
};

type GeotiffRendererData = {
    values: ArrayBuffer,
    width: number,
    height: number,
    noData?: number,
    imageExtent: number[],
    outputExtent?: number[],
    flipY?: boolean
};

export class GeotiffRenderer {

    protected static srsDefProvider_ = new EpsgIoDefinitionProvider();
    protected static defaultCacheInstance_: LruCache | undefined;
    protected static decoder_ = new Pool();  //undefined; // getGeotiffDecoder(); //new Pool();

    /**
     *Canvas used for post rendering transformations (e.g. extent scaling)
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
                max: 1e8,
                length: (item, key) => {
                    return item.values ? item.values.byteLength : 0;
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

    protected cache_: LruCache;
    protected plotty_: PlottyRenderer;
    protected axiosInstance_: AxiosInstanceWithCancellation | undefined;

    constructor(config: GeotiffRendererConfig) {
        this.cache_ = config.cache || GeotiffRenderer.getDefaultCacheInstance_();

        this.plotty_ = new PlottyRenderer({
            plottyInstance: config.plottyInstance
        });

        this.axiosInstance_ = config.axiosInstace;
    }

    get cache() {
        return this.cache_;
    }

    get plotty() {
        return this.plotty_;
    }

    renderFromUrl(params: RenderFromUrlParams): Promise<{canvas: HTMLCanvasElement, newSrsDefinition: boolean} | undefined> {
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
            const cachedData: GeotiffRendererData = this.cache.get(params.url);
            if (cachedData) {
                if (!cachedData.values) {
                    return Promise.resolve(undefined);
                } else {
                    return new Promise((resolve, reject) => {
                        setImmediate(() => {
                            const canvas = this.renderTiffImage_(cachedData);
                            resolve({
                                canvas,
                                newSrsDefinition: false
                            });
                        });
                    });
                }
                // return Promise.resolve({
                //     canvas,
                //     newSrsDefinition: false
                // });
            }
        }

        return requestHandler<ArrayBuffer>(dataRequest).then((response) => {
            return this.renderBuffer_({
                data: response.data,
                outputExtent: params.outputExtent,
                outputSrs: params.outputSrs
            }).then((response) => {
                const { canvas, newSrsDefinition, ...renderData } = response;

                if (!params.disableCache) {
                    this.cache_.set(params.url, renderData);
                }
                return {
                    canvas,
                    newSrsDefinition
                };
            }).catch(() => {
                if (params.retryCount) {
                    return this.renderFromUrl({
                        ...params,
                        retryCount: params.retryCount - 1
                    });
                }
                return undefined;
            });
        }).catch(() => {
            if (params.retryCount) {
                return this.renderFromUrl({
                    ...params,
                    retryCount: params.retryCount - 1
                });
            }
            if (!params.disableCache) {
                this.cache_.set(params.url, {
                    values: undefined
                });
            }
            return undefined;
        });

    }

    renderFromBuffer(params: RenderFromBufferParams) {
        return this.renderBuffer_(params).then((response) => {
            const { canvas, newSrsDefinition, ...renderData } = response;
            return {
                canvas,
                newSrsDefinition
            };
        });
    }

    protected renderBuffer_(params: RenderFromBufferParams): Promise<
        GeotiffRendererData & {newSrsDefinition: boolean, canvas: HTMLCanvasElement}
    > {
        return fromArrayBuffer(params.data).then((tiff) => {
            return tiff.getImage().then((image) => {
                return image.readRasters({pool: GeotiffRenderer.decoder_}).then((data) => {
                    let noData: number | undefined;
                    const gdalNoData = image.getFileDirectory().GDAL_NODATA;
                    if (gdalNoData) {
                        noData = parseFloat(gdalNoData);
                    }

                    // when y pixel size is positivie (very uncommon) we need to flip vertically the rendered image
                    const resolution = image.getResolution() || [];

                    return this.getImageExtent_(image, params.outputSrs).then((imageExtentData) => {
                        const renderData: GeotiffRendererData = {
                            values: data[0],
                            width: image.getWidth(),
                            height: image.getHeight(),
                            noData: noData,
                            outputExtent: params.outputExtent,
                            imageExtent: imageExtentData.extent,
                            flipY: resolution[1] > 0
                        };

                        const canvas = this.renderTiffImage_(renderData);

                        return {
                            ...renderData,
                            newSrsDefinition: imageExtentData.newSrsDefinition,
                            canvas: canvas
                        };
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
            outputCanvas = this.wrapImage_(outputCanvas, data.imageExtent, data.outputExtent);
        }
        return outputCanvas;
    }

    protected getImageExtent_(image, outputSrs?: string) {
        let imageExtent: number[] = image.getBoundingBox();
        if (outputSrs) {
            const imageSrs = this.getImageSrs_(image);
            if (imageSrs && imageSrs !== outputSrs) {
                // if the image is in a different srs than the requested output reproject the extent to the output srs and then
                // handle the rescaling. it works only if the two srs axes are aligned
                return this.registerSrs_(imageSrs).then(() => {
                    const extent = this.transformExtent_(image.getBoundingBox(), imageSrs, outputSrs);
                    return {
                        extent: extent,
                        newSrsDefinition: true
                    };
                });
            }
        }
        return Promise.resolve({
            extent: imageExtent,
            newSrsDefinition: false
        });
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
            return GeotiffRenderer.srsDefProvider_.getSrsDefinition(code).then((srsDef) => {
                proj4.defs(code, srsDef);
            }).then(() => {
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
                return  `EPSG:${imageSrs}`;
            } else {
                // user defined srs (http://geotiff.maptools.org/spec/geotiff6.html#6.3.3.1)
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    protected wrapImage_(sourceCanvas: HTMLCanvasElement, sourceExtent: number[], outputExtent: number[]) {
        const sourceWidth = sourceExtent[2] - sourceExtent[0];
        const sourceHeight = sourceExtent[3] - sourceExtent[1];
        const outputWidth = outputExtent[2] - outputExtent[0];
        const outputHeight = outputExtent[3] - outputExtent[1];
        const eps = 0.001;

        if (outputWidth - sourceWidth > eps || outputHeight - sourceHeight > eps) {

            const dw = sourceWidth / outputWidth * sourceCanvas.width;
            const dh = sourceHeight / outputHeight * sourceCanvas.height;
            const dx = (sourceExtent[0] - outputExtent[0]) / outputWidth * sourceCanvas.width;
            const dy = (outputExtent[3] - sourceExtent[3]) / outputHeight * sourceCanvas.height;

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
