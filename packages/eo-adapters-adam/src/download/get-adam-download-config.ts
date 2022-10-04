import download from 'downloadjs';

import { AxiosInstanceWithCancellation, NUMERIC_FIELD_ID } from '@oidajs/core';
import { DatasetDownloadConfig, DownloaMapVizRequest, RasterMapViz } from '@oidajs/eo-mobx';

import { AdamDatasetConfig } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { downloadAdamWcsRaster } from './download-adam-wcs-raster';
import { AdamServiceParamsSerializer, getColormapWcsParams } from '../utils';
import { AdamOpenSearchClient } from '../common';
import { getAdamVectorDownloadConfig } from './get-adam-vector-download-config';

export type AdamDatasetDownloadConfig = DatasetDownloadConfig & {
    downloadUrlProvider: (request: DownloaMapVizRequest) => Promise<{
        url: string;
        postData: string | undefined;
    }>;
};

export const getAdamDatasetDownloadConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {
    if (datasetConfig.type === 'vector') {
        if (factoryConfig.opensearchUrl) {
            const opensearchClient = new AdamOpenSearchClient({
                serviceUrl: factoryConfig.opensearchUrl,
                axiosInstance: axiosInstance
            });

            return getAdamVectorDownloadConfig({
                datasetId: datasetConfig.id,
                opensearchClient: opensearchClient,
                fixedTime: datasetConfig.fixedTime
            });
        } else {
            return undefined;
        }
    }

    const getDownloadRequestConfig = (request: DownloaMapVizRequest) => {
        if (request.datasetViz instanceof RasterMapViz) {
            const rasterParams = downloadAdamWcsRaster(datasetConfig, request.datasetViz);
            if (!rasterParams) {
                throw new Error('No coverage available');
            } else {
                const wcsParams: any = {
                    service: 'WCS',
                    request: 'GetCoverage',
                    version: '2.0.0',
                    coverageId: rasterParams.coverageId,
                    subdataset: rasterParams.subdataset,
                    format: request.format,
                    scale: request.options?.scale
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

                return {
                    url: factoryConfig.wcsServiceUrl,
                    params: {
                        ...wcsParams,
                        subset: rasterParams.subsets
                    },
                    postData: rasterParams.wktFilter
                };
            }
        } else {
            throw new Error('Unsupported dataset');
        }
    };

    const downloadUrlProvider = (request: DownloaMapVizRequest) => {
        try {
            const requestConfig = getDownloadRequestConfig(request);
            return Promise.resolve({
                url: `${factoryConfig.wcsServiceUrl}?${AdamServiceParamsSerializer(requestConfig.params)}`,
                postData: requestConfig.postData
            });
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const downloadProvider = (request: DownloaMapVizRequest) => {
        try {
            const requestConfig = getDownloadRequestConfig(request);
            return axiosInstance
                .cancelableRequest({
                    url: requestConfig.url,
                    method: requestConfig.postData ? 'POST' : 'GET',
                    data: requestConfig.postData,
                    params: requestConfig.params,
                    responseType: 'blob',
                    paramsSerializer: AdamServiceParamsSerializer
                })
                .then((response) => {
                    download(response.data, requestConfig.params.coverageId, request.format);
                });
        } catch (e) {
            return Promise.reject(e);
        }
    };

    const downloadConfig: AdamDatasetDownloadConfig = {
        downloadProvider: downloadProvider,
        downloadUrlProvider: downloadUrlProvider,
        supportedFormats: [
            { id: 'image/tiff', name: 'GeoTiff' },
            { id: 'application/tar', name: 'GeoTiff archive' },
            { id: 'image/png', name: 'PNG' },
            { id: 'image/jp2', name: 'Jpeg2000' },
            { id: 'image/gif', name: 'Animated GIF' }
        ],
        supportedOptions: {
            fields: [
                {
                    name: 'scale',
                    title: 'Scale',
                    type: NUMERIC_FIELD_ID,
                    required: true,
                    config: {
                        min: 0.05,
                        max: 1,
                        step: 0.05
                    },
                    rendererConfig: {
                        props: {
                            useSlider: true,
                            sliderProps: {
                                included: true
                            }
                        }
                    }
                }
            ],
            defaultValues: {
                scale: 1
            }
        }
    };

    return downloadConfig;
};
