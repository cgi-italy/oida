import { fromArrayBuffer } from 'geotiff';
import { plot } from 'plotty';
import LruCache from 'lru-cache';

import { AxiosInstanceWithCancellation } from '@oida/core';

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
            canvas: document.createElement('canvas')
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
    load: (source: {url: string, postData?: string}, flip: boolean) => Promise<string>;
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

    let load = (source: {url: string, data?: any}, flip?: boolean) => {

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
                                resolve(renderer.getCanvas().toDataURL());
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
                            renderer.setNoDataValue(noData);
                            renderer.setData(data[0], image.getWidth(), image.getHeight());
                            renderer.render();

                            dataCache.set(source.url, {
                                values: data[0],
                                width: image.getWidth(),
                                height: image.getHeight(),
                                noData: noData
                            });

                            if (getRotatedImage) {
                                return getRotatedImage(flip);
                            } else {
                                if (flip) {
                                    return getFlippedImage(renderer.getCanvas());
                                } else {
                                    return renderer.getCanvas().toDataURL();
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
