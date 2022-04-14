import LruCache from 'lru-cache';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { GeotiffRenderer } from '@oidajs/eo-geotiff';
import { PlottyRenderer } from '@oidajs/eo-geotiff';

export type createGeotiffTileLoaderProps = {
    axiosInstance: AxiosInstanceWithCancellation;
    rotateImage?: boolean;
};

export type GeotiffLoader = {
    load: (source: { url: string; postData?: string; requestExtent?: number[]; requestSrs?: string }) => Promise<string>;
    renderer: PlottyRenderer;
    dataCache: LruCache;
};

export const createGeoTiffLoader = (props: createGeotiffTileLoaderProps): GeotiffLoader => {
    const { axiosInstance, rotateImage } = props;

    const geotiffRenderer = new GeotiffRenderer({
        axiosInstace: axiosInstance
    });

    // vertical profile rendering needs the image to be rotated by 90 degrees and mirrored
    let getRotatedImage;
    if (rotateImage) {
        const rotationCanvas = document.createElement('canvas');
        const rotCtx = rotationCanvas.getContext('2d')!;

        getRotatedImage = (canvas) => {
            rotationCanvas.width = canvas.height;
            rotationCanvas.height = canvas.width;

            rotCtx.translate(rotationCanvas.width / 2, rotationCanvas.height / 2);
            rotCtx.rotate(-Math.PI / 2);
            rotCtx.scale(1, -1);
            rotCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

            return rotationCanvas.toDataURL();
        };
    }

    const load = (source: { url: string; data?: any; requestExtent?: number[]; requestSrs?: string }) => {
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
                        return getRotatedImage(response.canvas);
                    } else {
                        return response.canvas.toDataURL();
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
