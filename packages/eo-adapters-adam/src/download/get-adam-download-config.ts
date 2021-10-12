import download from 'downloadjs';

import { AxiosInstanceWithCancellation } from '@oida/core';
import { DatasetDownloadConfig, DownloaMapVizRequest, RasterMapViz } from  '@oida/eo-mobx';

import { AdamDatasetConfig } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { downloadAdamWcsRaster } from './download-adam-wcs-raster';
import { AdamServiceParamsSerializer, getColormapWcsParams } from '../utils';

export const getAdamDatasetDownloadConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {


    const downloadProvider = (request: DownloaMapVizRequest) => {
        if (request.datasetViz instanceof RasterMapViz) {
            const rasterParams = downloadAdamWcsRaster(datasetConfig, request.datasetViz);
            if (!rasterParams) {
                return Promise.reject('No coverage available');
            } else {
                let wcsParams: any = {
                    service: 'WCS',
                    request: 'GetCoverage',
                    version: '2.0.0',
                    coverageId: rasterParams.coverageId,
                    subdataset: rasterParams.subdataset,
                    format: request.format,
                    scale: request.scale
                };

                const subsets = rasterParams.subsets;
                if (request.format === 'image/png' || request.format === 'image/gif') {
                    if (rasterParams.bandSubset) {
                        subsets.push(rasterParams.bandSubset);
                    }

                    const colorMapParams = getColormapWcsParams(request.datasetViz.bandMode);
                    if (colorMapParams.colorTable) {
                        wcsParams.colortable = colorMapParams.colorTable;
                    }
                    if (colorMapParams.colorRange) {
                        wcsParams.colorrange = colorMapParams.colorRange;
                    }
                }

                return axiosInstance.cancelableRequest({
                    url: factoryConfig.wcsServiceUrl,
                    method: rasterParams.wktFilter ? 'POST' : 'GET',
                    data: rasterParams.wktFilter,
                    params: {
                        ...wcsParams,
                        subset: rasterParams.subsets,
                    },
                    responseType: 'blob',
                    paramsSerializer: AdamServiceParamsSerializer
                }).then((response) => {
                    download(response.data, wcsParams.coverageId, request.format);
                });
            }
        } else {
            return Promise.reject('Unsupported dataset');
        }
    };

    let downloadConfig: DatasetDownloadConfig = {
        downloadProvider: downloadProvider,
        supportedFormats: [
            {id: 'image/tiff', name: 'GeoTiff'},
            {id: 'application/tar', name: 'GeoTiff archive'},
            {id: 'image/png', name: 'PNG'},
            {id: 'image/jp2', name: 'Jpeg2000'},
            {id: 'image/gif', name: 'Animated GIF'}
        ]
    };

    return downloadConfig;
};
