import LruCache from 'lru-cache';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { GeotiffRenderer, PlottyRenderer, GeotiffRendererData } from '@oidajs/eo-geotiff';

import { AdamWcsTileLoadFunctionSource } from '../map-view/adam-wcs-tile-source';

export type createGeotiffTileLoaderProps = {
    axiosInstance: AxiosInstanceWithCancellation;
    rotateImage?: boolean;
};

export type GeotiffLoader = {
    load: (source: AdamWcsTileLoadFunctionSource) => Promise<string>;
    renderer: PlottyRenderer;
    dataCache: LruCache<string, GeotiffRendererData | null>;
};

export const createGeoTiffLoader = (props: createGeotiffTileLoaderProps): GeotiffLoader => {
    const { axiosInstance, rotateImage } = props;

    const geotiffRenderer = new GeotiffRenderer({
        axiosInstace: axiosInstance
    });

    // vertical profile rendering needs the image to be rotated by 90 degrees and mirrored
    let getRotatedImage: ((image: HTMLImageElement) => string) | undefined;
    if (rotateImage) {
        const rotationCanvas = document.createElement('canvas');
        const rotCtx = rotationCanvas.getContext('2d')!;

        getRotatedImage = (image: HTMLImageElement) => {
            rotationCanvas.width = image.height;
            rotationCanvas.height = image.width;

            rotCtx.translate(rotationCanvas.width / 2, rotationCanvas.height / 2);
            rotCtx.rotate(-Math.PI / 2);
            rotCtx.scale(1, -1);
            rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

            return rotationCanvas.toDataURL();
        };
    }

    const load = (source: AdamWcsTileLoadFunctionSource) => {
        return geotiffRenderer
            .renderFromUrl({
                url: source.url,
                postData: source.data,
                outputExtent: source.requestExtent,
                outputSrs: source.requestSrs,
                retryCount: 2
            })
            .then((response) => {
                if (!response) {
                    return '';
                } else {
                    if (response.newSrsDefinition) {
                        register(proj4);
                    }
                    if (getRotatedImage) {
                        return new Promise<string>((resolve, reject) => {
                            const image = new Image();
                            image.src = response.imageData;
                            image.addEventListener('load', () => {
                                resolve(getRotatedImage!(image));
                            });
                            image.addEventListener('error', () => {
                                resolve('');
                            });
                        });
                    } else {
                        return response.imageData;
                    }
                }
            });
    };

    return {
        load,
        renderer: geotiffRenderer.plotty,
        dataCache: geotiffRenderer.cache
    };
};
