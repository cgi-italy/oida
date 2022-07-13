import download from 'downloadjs';

import { AOI_FIELD_ID, DATE_RANGE_FIELD_ID, QueryFilter, STRING_FIELD_ID } from '@oidajs/core';
import { DatasetVectorMapViz, DownloaMapVizRequest } from '@oidajs/eo-mobx';
import { AdamOpenSearchClient } from '../common/adam-opensearch-client';
import { AdamDatasetDownloadConfig } from './get-adam-download-config';

export type AdamVectorDownloadConfig = {
    opensearchClient: AdamOpenSearchClient;
    datasetId: string;
    fixedTime?: boolean | Date;
};

export const getAdamVectorDownloadConfig = (config: AdamVectorDownloadConfig) => {
    const getRequestFilters = (request: DownloaMapVizRequest<DatasetVectorMapViz>) => {
        const filters: QueryFilter<string, any>[] = [
            {
                key: 'datasetId',
                type: STRING_FIELD_ID,
                value: config.datasetId
            }
        ];

        const aoi = request.datasetViz.dataset.aoi;
        if (aoi) {
            filters.push({
                key: 'geometry',
                type: AOI_FIELD_ID,
                value: aoi
            });
        }

        if (config.fixedTime) {
            if (config.fixedTime instanceof Date) {
                filters.push({
                    key: 'timeRange',
                    type: DATE_RANGE_FIELD_ID,
                    value: {
                        start: config.fixedTime
                    }
                });
            }
        } else {
            const toi = request.datasetViz.dataset.toi;
            if (toi) {
                if (toi instanceof Date) {
                    filters.push({
                        key: 'timeRange',
                        type: DATE_RANGE_FIELD_ID,
                        value: {
                            start: toi,
                            end: toi
                        }
                    });
                } else {
                    filters.push({
                        key: 'timeRange',
                        type: DATE_RANGE_FIELD_ID,
                        value: {
                            start: toi.start,
                            end: toi.end
                        }
                    });
                }
            }
        }

        const subdataset = request.datasetViz.dimensions.values.get('subdataset');
        if (typeof subdataset === 'string') {
            filters.push({
                key: 'subDatasetId',
                type: STRING_FIELD_ID,
                value: subdataset
            });
        }

        request.datasetViz.propertyFilters.asArray().forEach((item) => {
            filters.push(item);
        });

        return filters;
    };

    const downloadProvider = (request: DownloaMapVizRequest<DatasetVectorMapViz>) => {
        const filters = getRequestFilters(request);

        return new Promise<void>((resolve, reject) => {
            let page = 0;
            const pageSize = 100;
            let offset = page * pageSize;
            const features: GeoJSON.Feature[] = [];
            const getNextPage = () => {
                return config.opensearchClient
                    .searchProducts({
                        filters: filters,
                        paging: {
                            pageSize: pageSize,
                            page: page,
                            offset: offset
                        }
                    })
                    .then((response) => {
                        features.push(
                            ...response.features.map((feature) => {
                                const { geometry, ...props } = feature;
                                return {
                                    type: 'Feature',
                                    geometry: geometry,
                                    properties: props
                                } as GeoJSON.Feature;
                            })
                        );
                        if (offset + pageSize < response.properties.totalResults) {
                            page++;
                            offset += pageSize;
                            getNextPage();
                        } else {
                            const jsonBlob = new Blob(
                                [
                                    JSON.stringify({
                                        type: 'FeatureCollection',
                                        features: features
                                    })
                                ],
                                {
                                    type: 'application/json'
                                }
                            );
                            download(jsonBlob, config.datasetId, 'application/json');
                            resolve();
                        }
                    })
                    .catch((error) => {
                        reject(new Error(`Unable to download data: ${error}`));
                    });
            };
            getNextPage();
        });
    };

    const downloadUrlProvider = (request: DownloaMapVizRequest<DatasetVectorMapViz>) => {
        const filters = getRequestFilters(request);

        return config.opensearchClient
            .getProductSearchUrls({
                filters: filters
            })
            .then((urls) => {
                return {
                    url: urls.join('\n')
                };
            });
    };

    return {
        supportedFormats: [{ id: 'application/json', name: 'GeoJSON' }],
        downloadProvider: downloadProvider,
        downloadUrlProvider: downloadUrlProvider
    } as AdamDatasetDownloadConfig;
};
