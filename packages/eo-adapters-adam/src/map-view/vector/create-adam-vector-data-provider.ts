import { AOI_FIELD_ID, DATE_RANGE_FIELD_ID, QueryFilter, STRING_FIELD_ID } from '@oidajs/core';
import { VectorDataGeneratorFactory } from '@oidajs/eo-mobx';

import { AdamVectorDatasetConfig } from '../../adam-dataset-config';
import { AdamOpenSearchClient } from '../../common/adam-opensearch-client';

export const createAdamVectorDataProvider = (datasetConfig: AdamVectorDatasetConfig, openSearchClient: AdamOpenSearchClient) => {
    const vectorDataGenerator: VectorDataGeneratorFactory = (vectorViz) => {
        const filters: QueryFilter<string, any>[] = [
            {
                key: 'datasetId',
                type: STRING_FIELD_ID,
                value: datasetConfig.id
            }
        ];

        if (vectorViz.dataset.aoi) {
            filters.push({
                key: 'geometry',
                type: AOI_FIELD_ID,
                value: vectorViz.dataset.aoi
            });
        }

        let hasValidTime = true;
        if (!datasetConfig.fixedTime) {
            const toi = vectorViz.dataset.toi;
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
            } else {
                hasValidTime = false;
            }
        } else if (datasetConfig.fixedTime instanceof Date) {
            filters.push({
                key: 'timeRange',
                type: DATE_RANGE_FIELD_ID,
                value: {
                    start: datasetConfig.fixedTime
                }
            });
        }

        const subdataset = vectorViz.dimensions.values.get('subdataset');
        if (typeof subdataset === 'string') {
            filters.push({
                key: 'subDatasetId',
                type: STRING_FIELD_ID,
                value: subdataset
            });
        }

        vectorViz.propertyFilters.asArray().forEach((item) => {
            filters.push(item);
        });

        const generator = function* () {
            let page = 0;
            const pageSize = 100;
            let offset = page * pageSize;
            let done = false;

            const getNextPage = () => {
                if (!hasValidTime) {
                    return Promise.reject(new Error('No time selected'));
                } else {
                    return openSearchClient
                        .searchProducts({
                            filters: filters,
                            paging: {
                                pageSize: pageSize,
                                page: page,
                                offset: offset
                            }
                        })
                        .then((response) => {
                            if (offset + pageSize < response.properties.totalResults) {
                                page++;
                                offset += pageSize;
                            } else {
                                done = true;
                            }
                            return response.features.map((feature) => {
                                const { catalogueId, geometry, ...properties } = feature;
                                return {
                                    id: catalogueId,
                                    geometry: geometry,
                                    properties: {
                                        ...properties
                                    }
                                };
                            });
                        });
                }
            };

            while (!done) {
                yield getNextPage();
            }
        };

        return generator();
    };

    return vectorDataGenerator;
};
