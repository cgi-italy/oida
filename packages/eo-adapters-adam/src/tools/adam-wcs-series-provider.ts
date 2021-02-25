
import { transform, transformExtent } from 'ol/proj';

import {
    AxiosInstanceWithCancellation, createAxiosInstance
} from '@oida/core';

import { DatasetDimensionSeriesRequest, isValueDomain, isDomainProvider, DatasetDimensionSeriesValueItem } from '@oida/eo-mobx';

import { AdamDatasetDimension, AdamDatasetSingleBandCoverage } from '../adam-dataset-config';
import { AdamServiceParamsSerializer } from '../utils';

export type AdamWCSSeriesProviderConfig = {
    serviceUrl: string;
    dimensions: AdamDatasetDimension[];
    variables: AdamDatasetSingleBandCoverage[];
    coverageSrs: string;
    extentOffset?: number[],
    axiosInstance?: AxiosInstanceWithCancellation
};

export class AdamWcsSeriesProvider  {

    protected axiosInstance_: AxiosInstanceWithCancellation;
    protected config_: AdamWCSSeriesProviderConfig;


    constructor(config: AdamWCSSeriesProviderConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.config_ = config;
    }

    getSeries(request: DatasetDimensionSeriesRequest) {
        let wcsParams = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            format: 'application/json',
        };

        if (request.geometry.type === 'Point') {
            let subsets = {} as Record<string, string[]>;

            let dimensionConfig: AdamDatasetDimension | undefined;

            this.config_.dimensions.forEach((dimension) => {
                if (dimension.id === request.dimension) {
                    if (request.range) {
                        if (dimension.id === 'time') {
                            subsets['unix'] =
                                [`${(request.range.min as Date).toISOString()},${(request.range.max as Date).toISOString()}`];
                        } else {
                            subsets[dimension.wcsSubset.id] = [`${request.range.min},${request.range.max}`];
                        }
                    } else {
                        if (dimension.wcsSubset.idx !== undefined) {
                            let currentSubset = subsets[dimension.wcsSubset.id] || [];
                            currentSubset.splice(dimension.wcsSubset.idx, 0, '*');
                            subsets[dimension.wcsSubset.id] = currentSubset;
                        }
                    }
                    dimensionConfig = dimension;
                } else {
                    if (request.dimensionValues) {
                        let value = request.dimensionValues.get(dimension.id);
                        if (value !== undefined) {
                            let stringValue: string;
                            if (dimension.id === 'time') {
                                stringValue = (value as Date).toISOString();
                            } else {
                                stringValue = value.toString();
                            }
                            if (dimension.wcsSubset.idx !== undefined) {
                                let currentSubset = subsets[dimension.wcsSubset.id] || [];
                                currentSubset.splice(dimension.wcsSubset.idx, 0, stringValue);
                                subsets[dimension.wcsSubset.id] = currentSubset;
                            } else {
                                subsets[dimension.wcsSubset.id] = [stringValue];
                            }
                        }
                    }
                }
            });

            if (!dimensionConfig) {
                return Promise.reject(`The requested dimension "${request.dimension}" doesn't exists`);
            }

            let coverage: string;
            let variableConfig = this.config_.variables!.find((variable) => variable.id === request.variable);
            if (variableConfig) {
                coverage = variableConfig.wcsCoverage;
                if (variableConfig.wcsSubset) {
                    if (variableConfig.wcsSubset.idx !== undefined) {
                        let currentSubset = subsets[variableConfig.wcsSubset.id] || [];
                        currentSubset.splice(variableConfig.wcsSubset.idx, 0, variableConfig.wcsSubset.value);
                        subsets[variableConfig.wcsSubset.id] = currentSubset;
                    } else {
                        subsets[variableConfig.wcsSubset.id] = [variableConfig.wcsSubset.value];
                    }
                }
            } else {
                return Promise.reject(`The requested variable "${request.variable}" doesn't exists`);
            }

            const subset = Object.keys(subsets).map((subsetId) => {
                return `${subsetId}(${subsets[subsetId].join(',')})`;
            });

            let requestCoord = transform(request.geometry.coordinates, 'EPSG:4326', this.config_.coverageSrs);

            const extentOffset = this.config_.extentOffset;
            if (extentOffset) {
                requestCoord[0] += extentOffset[0];
                requestCoord[1] += extentOffset[1];
            }

            subset.push(`E(${requestCoord[0]},${requestCoord[0]})`);
            subset.push(`N(${requestCoord[1]},${requestCoord[1]})`);

            return this.axiosInstance_.cancelableRequest({
                url: this.config_.serviceUrl,
                params: {
                    ...wcsParams,
                    coverageId: coverage,
                    subset: subset,
                },
                responseType: 'json',
                paramsSerializer: AdamServiceParamsSerializer
            }).then((response) => {
                return this.parseWcsResponse_(response.data, dimensionConfig!).then((data) => {
                    const noData = variableConfig?.domain?.noData;
                    if (noData !== undefined) {
                        return data.filter(item => item.y !== noData);
                    } else {
                        return data;
                    }
                });
            });
        } else {
            return Promise.reject('Only point geometry are supported in WCS series');
        }
    }

    protected parseWcsResponse_(response, dimension: AdamDatasetDimension): Promise<DatasetDimensionSeriesValueItem[]> {
        if (dimension.id === 'time') {
            const data = response.data.map((item) => {
                return {
                    x: new Date(item.time * 1000),
                    y: item.raster[0][0][0]
                };
            });

            return Promise.resolve(data.sort((i1, i2) => i1.x - i2.x));
        } else {
            return this.getDimensionDomain_(dimension).then((domain) => {
                if (dimension.id === 'band') {
                    return response.data[0].raster.map((item, idx) => {
                        return {
                            x: domain ? domain[idx].label || domain[idx].value : idx,
                            y: item[0][0]
                        };
                    });
                } else {
                    if (!domain || isValueDomain(domain)) {
                        if (!dimension.wcsResponseKey) {
                            return Promise.reject('Unable to parse WCS response without domain responseKey information');
                        }
                        const data = response.data.map((item) => {
                            return {
                                x: item[dimension.wcsResponseKey],
                                y: item.raster[0][0][0]
                            };
                        });
                        return data.sort((i1, i2) => i1.x - i2.x);
                    } else {
                        return response.data.map((item, idx) => {
                            return {
                                x: domain[idx].label || domain[idx].value,
                                y: item.raster[0][0][0]
                            };
                        });
                    }
                }
            });
        }

    }

    protected getDimensionDomain_(dimension: AdamDatasetDimension) {
        if (dimension.domain && isDomainProvider(dimension.domain)) {
            return dimension.domain();
        } else {
            return Promise.resolve(dimension.domain);
        }
    }
}
