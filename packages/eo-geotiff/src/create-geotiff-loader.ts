import { fromArrayBuffer } from 'geotiff';
import { plot } from 'plotty';
import LruCache from 'lru-cache';
import proj4 from 'proj4';

import { AxiosInstanceWithCancellation, SpatialReferenceOrgDefinitionProvider } from '@oida/core';

class PlottyRendererWrapper {
    protected renderer_: plot;
    protected noDataValue_: number | undefined;
    protected colorScale_: string;
    protected domain_: number[];
    protected clamp_: boolean;

    constructor(renderer) {
        this.renderer_ = renderer;
        this.noDataValue_ = renderer.noDataValue;
        this.colorScale_ = renderer.name;
        this.domain_ = renderer.domain;
        this.clamp_ = renderer.clampLow;
    }

    getCanvas(): HTMLCanvasElement {
        return this.renderer_.getCanvas();
    }

    setData(data, width: number, height: number) {
        this.renderer_.setData(data, width, height);
    }

    setNoDataValue(noDataValue: number | undefined) {
        this.noDataValue_ = noDataValue;
    }

    setColorScale(colorScale: string) {
        this.colorScale_ = colorScale;
    }

    setDomain(domain: number[]) {
        this.domain_ = domain;
    }

    setClamp(clamp: boolean) {
        this.clamp_ = clamp;
    }

    render() {
        this.renderer_.setClamp(this.clamp_);
        this.renderer_.setDomain(this.domain_);
        this.renderer_.setColorScale(this.colorScale_);
        this.renderer_.setNoDataValue(this.noDataValue_);

        return this.renderer_.render();
    }

}


let rawDataRenderer: plot | undefined = undefined;

/**
 * Use the same plotty renderer instance for all loaders. Each plotty instance create a
 * new webGL context and we want to avoid the creation of multiple GL contexts.
 */
const getOrCreateRawDataRenderer = () => {
    if (!rawDataRenderer) {
        rawDataRenderer = new plot({
            canvas: document.createElement('canvas'),
            //the webgl renderer is not currently able to handle NaN values. Disable it for now
            useWebGL: false
        });
    }
    return new PlottyRendererWrapper(rawDataRenderer);
};

let rawDataCache: LruCache | undefined = undefined;
const getOrCreateRawDataCacheInstance = () => {
    if (!rawDataCache) {
        rawDataCache = new LruCache({
            max: 1e8,
            length: (item, key) => {
                return item.values ? item.values.byteLength : 0;
            }
        });
    }
    return rawDataCache;
};


export type createGeotiffTileLoaderProps = {
    axiosInstance: AxiosInstanceWithCancellation;
    rotateImage?: boolean;
};

export type GeotiffLoader = {
    load: (source: {url: string, postData?: string, requestExtent?: number[], requestSrs?: string}, flip: boolean) => Promise<string>;
    renderer: PlottyRendererWrapper,
    dataCache: LruCache
};

export const createGeoTiffLoader = (props: createGeotiffTileLoaderProps): GeotiffLoader => {

    const { axiosInstance, rotateImage } = props;

    const renderer = getOrCreateRawDataRenderer();

    const dataCache = getOrCreateRawDataCacheInstance();

    const flipCanvas = document.createElement('canvas');
    const flipCtx = flipCanvas.getContext('2d')!;

    //TODO: remove this once cesium texture flip is solved
    const getFlippedImage = (canvas) => {
        flipCanvas.width = canvas.width;
        flipCanvas.height = canvas.height;

        flipCtx.translate(canvas.width, 0);
        flipCtx.scale(-1, 1);

        flipCtx.drawImage(canvas, 0, 0);

        return flipCanvas.toDataURL();
    };

    let getRotatedImage;
    if (rotateImage) {
        let rotationCanvas = document.createElement('canvas');
        let rotCtx = rotationCanvas.getContext('2d')!;
        rotCtx.rotate(-Math.PI / 2);

        getRotatedImage = (flip) => {

            let plottyCanvas = renderer.getCanvas();

            rotationCanvas.width = plottyCanvas.height;
            rotationCanvas.height = plottyCanvas.width;

            rotCtx.rotate(-Math.PI / 2);
            rotCtx.drawImage(plottyCanvas, -plottyCanvas.width, 0);

            if (flip) {
                return getFlippedImage(rotationCanvas);
            } else {
                return rotationCanvas.toDataURL();
            }
        };
    }

    let scaleCanvas = document.createElement('canvas');
    let scaleCtx = scaleCanvas.getContext('2d')!;

    const getImageSource = (requestExtent, responseExtent) => {
        let requestWidth = requestExtent[2] - requestExtent[0];
        let requestHeight = requestExtent[3] - requestExtent[1];
        let responseWidth = responseExtent[2] - responseExtent[0];
        let responseHeight = responseExtent[3] - responseExtent[1];
        if (requestWidth - responseWidth > 0.001 || requestHeight - responseHeight > 0.001) {

            let plottyCanvas = renderer.getCanvas();

            const dw = responseWidth / requestWidth * plottyCanvas.width;
            const dh = responseHeight / requestHeight * plottyCanvas.height;
            const dx = (responseExtent[0] - requestExtent[0]) / requestWidth * plottyCanvas.width;
            const dy = (requestExtent[3] - responseExtent[3]) / requestHeight * plottyCanvas.height;

            scaleCanvas.width = plottyCanvas.width;
            scaleCanvas.height = plottyCanvas.height;

            scaleCtx.clearRect(0, 0, scaleCanvas.width, scaleCanvas.height);
            scaleCtx.drawImage(plottyCanvas, dx, dy, dw, dh);
            return scaleCanvas.toDataURL();
        } else {
            return renderer.getCanvas().toDataURL();
        }
    };

    const srsDefGetter = new SpatialReferenceOrgDefinitionProvider();

    let load = (source: {url: string, data?: any, requestExtent?: number[], requestSrs?: string}, flip?: boolean) => {

        let cachedData = dataCache.get(source.url);

        if (cachedData) {
            if (!cachedData.values) {
                return Promise.resolve('');
            } else {
                return new Promise<string>((resolve) => {
                    setImmediate(() => {
                        renderer.setNoDataValue(cachedData.noData);
                        renderer.setData(
                            cachedData.values,
                            cachedData.width, cachedData.height
                        );
                        renderer.render();
                        if (getRotatedImage) {
                            resolve(getRotatedImage(flip));
                        } else {
                            if (flip) {
                                resolve(getFlippedImage(renderer.getCanvas()));
                            } else {
                                if (cachedData.requestExtent) {
                                    resolve(getImageSource(cachedData.requestExtent, cachedData.responseExtent));
                                } else {
                                    resolve(renderer.getCanvas().toDataURL());
                                }
                            }
                        }
                    });
                });
            }
        } else {
            return axiosInstance.post(source.url, source.data, {
                responseType: 'arraybuffer'
            }).then((response) => {
                return fromArrayBuffer(response.data).then((tiff) => {
                    return tiff.getImage().then((image) => {
                        return image.readRasters().then((data) => {

                            let noData;
                            let gdalNoData = image.getFileDirectory().GDAL_NODATA;
                            if (gdalNoData) {
                                noData = parseFloat(gdalNoData);
                            }

                            const requestExtent = source.requestExtent;
                            let responseExtent = image.getBoundingBox();

                            if (requestExtent) {
                                // if the response is in a different srs than the request reproject the extent to the request srs and then
                                // handle the rescaling. it works only if the two srs axes are aligned
                                if (source.requestSrs) {
                                    let responseSrs = image.geoKeys.ProjectedCSTypeGeoKey || image.geoKeys.GeographicTypeGeoKey;
                                    if (responseSrs) {
                                        responseSrs = `EPSG:${responseSrs}`;
                                        if (responseSrs !== source.requestSrs) {
                                            if (!proj4.defs(responseSrs)) {
                                                return srsDefGetter.getSrsDefinition(responseSrs).then((srsDef) => {
                                                    proj4.defs(responseSrs, srsDef);

                                                    const ll = proj4(
                                                        responseSrs, source.requestSrs, [responseExtent[0], responseExtent[1]]
                                                    );
                                                    const ur = proj4(
                                                        responseSrs, source.requestSrs, [responseExtent[2], responseExtent[3]]
                                                    );

                                                    responseExtent = [...ll, ...ur];

                                                    dataCache.set(source.url, {
                                                        values: data[0],
                                                        width: image.getWidth(),
                                                        height: image.getHeight(),
                                                        noData: noData,
                                                        requestExtent: requestExtent,
                                                        responseExtent: responseExtent
                                                    });

                                                    renderer.setNoDataValue(noData);
                                                    renderer.setData(data[0], image.getWidth(), image.getHeight());
                                                    renderer.render();

                                                    if (getRotatedImage) {
                                                        return getRotatedImage(flip);
                                                    } else {
                                                        if (flip) {
                                                            return getFlippedImage(renderer.getCanvas());
                                                        } else {
                                                            return getImageSource(requestExtent, responseExtent);
                                                        }
                                                    }
                                                });
                                            }
                                            const ll = proj4(responseSrs, source.requestSrs, [responseExtent[0], responseExtent[1]]);
                                            const ur = proj4(responseSrs, source.requestSrs, [responseExtent[2], responseExtent[3]]);
                                            responseExtent = [...ll, ...ur];
                                        }

                                    }
                                }
                            }

                            renderer.setNoDataValue(noData);
                            renderer.setData(data[0], image.getWidth(), image.getHeight());
                            renderer.render();

                            dataCache.set(source.url, {
                                values: data[0],
                                width: image.getWidth(),
                                height: image.getHeight(),
                                noData: noData,
                                requestExtent: requestExtent,
                                responseExtent: responseExtent
                            });

                            if (getRotatedImage) {
                                return getRotatedImage(flip);
                            } else {
                                if (flip) {
                                    return getFlippedImage(renderer.getCanvas());
                                } else {
                                    if (requestExtent) {
                                        return getImageSource(requestExtent, responseExtent);
                                    } else {
                                        return renderer.getCanvas().toDataURL();
                                    }
                                }
                            }
                        }).catch(() => {
                            return '';
                        });
                    }).catch(() => {
                        return '';
                    });
                }).catch(() => {
                    return '';
                });
            }).catch((response) => {
                dataCache.set(source.url, {
                    values: undefined,
                    width: 0,
                    height: 0
                });
                return '';
            });
        }
    };

    return {
        load,
        renderer,
        dataCache
    };
};
