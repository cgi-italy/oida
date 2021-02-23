import LruCache from 'lru-cache';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import { AxiosInstanceWithCancellation } from '@oida/core';
import { GeotiffRenderer } from '@oida/eo-geotiff';
import { PlottyRenderer } from '@oida/eo-geotiff';


export type createGeotiffTileLoaderProps = {
    axiosInstance: AxiosInstanceWithCancellation;
    rotateImage?: boolean;
};

export type GeotiffLoader = {
    load: (source: {url: string, postData?: string, requestExtent?: number[], requestSrs?: string}, flip: boolean) => Promise<string>;
    renderer: PlottyRenderer,
    dataCache: LruCache
};

export const createGeoTiffLoader = (props: createGeotiffTileLoaderProps): GeotiffLoader => {

    const { axiosInstance, rotateImage } = props;

    const geotiffRenderer = new GeotiffRenderer({
        axiosInstace: axiosInstance
    });

    let getRotatedImage;
    if (rotateImage) {
        let rotationCanvas = document.createElement('canvas');
        let rotCtx = rotationCanvas.getContext('2d')!;
        rotCtx.rotate(-Math.PI / 2);

        getRotatedImage = (canvas) => {

            rotationCanvas.width = canvas.height;
            rotationCanvas.height = canvas.width;

            rotCtx.rotate(-Math.PI / 2);
            rotCtx.drawImage(canvas, -canvas.width, 0);

            return rotationCanvas.toDataURL();
        };
    }


    let load = (source: {url: string, data?: any, requestExtent?: number[], requestSrs?: string}, flip?: boolean) => {

        return geotiffRenderer.renderFromUrl({
            url: source.url,
            postData: source.data,
            outputExtent: source.requestExtent,
            outputSrs: source.requestSrs,
            retryCount: 2
        }).then((response) => {
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
