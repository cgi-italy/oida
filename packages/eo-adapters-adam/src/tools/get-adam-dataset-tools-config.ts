import { AxiosInstanceWithCancellation } from '@oidajs/core';
import {
    POINT_SERIES_PROCESSING,
    DatasetPointSeriesConfig,
    DatasetTimeDistributionProvider,
    DatasetToolConfig,
    TRANSECT_VALUES_PROCESSING,
    DatasetTransectValuesConfig
} from '@oidajs/eo-mobx';

import { AdamDatasetConfig, AdamDatasetSingleBandCoverage, isMultiBandCoverage, AdamDatasetDimension } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
import { AdamWcsSeriesProvider } from './adam-wcs-series-provider';
import { AdamWpsAnalysisProvider } from './adam-wps-analysis-provider';

export const getAdamDatasetToolsConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    timeDistributionProvider?: DatasetTimeDistributionProvider
) => {
    const variables: AdamDatasetSingleBandCoverage[] = [];

    const dimensions: AdamDatasetDimension[] = datasetConfig.dimensions
        ? datasetConfig.dimensions.slice().map((dimension) => {
              let preventSeries = false;

              // disable series on campaign data
              if (
                  dimension.id === 'subdataset' ||
                  dimension.id === 'SubRegion' ||
                  dimension.id === 'Product' ||
                  dimension.id === 'SceneType' ||
                  dimension.id === 'image' ||
                  dimension.id === 'plan'
              ) {
                  preventSeries = true;
              }
              return {
                  ...dimension,
                  preventSeries: preventSeries
              };
          })
        : [];

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        const bandDimension: AdamDatasetDimension = {
            id: 'band',
            name: 'Band',
            wcsSubset: {
                id: 'band'
            },
            wcsResponseKey: '',
            tarFilenameRegex: /band\(([^)]*)\)/,
            domain: {
                values: datasetConfig.coverages.bands.map((band) => {
                    return {
                        label: band.name,
                        value: band.idx
                    };
                })
            }
        };
        dimensions.push(bandDimension);

        const bandsDomain = {
            min: Number.MAX_VALUE,
            max: -Number.MAX_VALUE
        };

        datasetConfig.coverages.bands.forEach((band) => {
            if (band.domain && band.domain.min !== undefined && band.domain.max !== undefined) {
                bandsDomain.min = Math.min(bandsDomain.min, band.domain.min);
                bandsDomain.max = Math.max(bandsDomain.max, band.domain.max);
            }
        });

        variables.push({
            id: `${datasetConfig.id}_band_value`,
            name: 'Band value',
            wcsCoverage: datasetConfig.coverages.wcsCoverage,
            domain: bandsDomain[0] < bandsDomain[1] ? bandsDomain : undefined
        });
    } else {
        variables.push(...datasetConfig.coverages);
    }

    if (!datasetConfig.fixedTime) {
        const timeDimension: AdamDatasetDimension = {
            id: 'time',
            name: 'Time',
            wcsSubset: {
                id: 'unix'
            },
            wcsResponseKey: 'time',
            tarFilenameRegex: /([0-9]{4})([0-9]{2})([0-9]{2})\.([0-9]{2})([0-9]{2})([0-9]{2})/,
            domain: timeDistributionProvider
                ? () => {
                      return timeDistributionProvider!.getTimeExtent().then((extent) => {
                          return {
                              min: extent?.start || new Date(0),
                              max: extent?.end || new Date()
                          };
                      });
                  }
                : undefined
        };

        dimensions.unshift(timeDimension);
    }

    let wpsAnalysisProvider: AdamWpsAnalysisProvider | undefined;
    if (factoryConfig.wpsServiceUrl) {
        wpsAnalysisProvider = new AdamWpsAnalysisProvider({
            axiosInstance: axiosInstance,
            serviceUrl: factoryConfig.wpsServiceUrl,
            variables: variables
        });
    }

    const tools: DatasetToolConfig[] = [];

    if (variables.length) {
        const wcsSeriesProvider = new AdamWcsSeriesProvider({
            axiosInstance: axiosInstance,
            coverageSrs: datasetConfig.coverageExtent?.srs,
            serviceUrl: factoryConfig.wcsServiceUrl,
            extentOffset: datasetConfig.requestExtentOffset,
            variables: variables,
            dimensions: dimensions
        });

        if (dimensions.filter((dimension) => !dimension.preventSeries).length) {
            const dimensionSeriesToolConfig: DatasetPointSeriesConfig = {
                variables: variables,
                dimensions: dimensions,
                provider: (request) => {
                    return wcsSeriesProvider.getSeries(request);
                }
            };

            tools.push({
                type: POINT_SERIES_PROCESSING,
                name: 'Series analysis',
                config: dimensionSeriesToolConfig
            });
        }
    }

    // transect supports only time subsetting
    if (wpsAnalysisProvider && variables.length && (!dimensions.length || (dimensions.length === 1 && dimensions[0].id === 'time'))) {
        const transectSeriesConfig: DatasetTransectValuesConfig = {
            variables: variables,
            dimensions: dimensions,
            provider: (request) => {
                if (datasetConfig.fixedTime instanceof Date) {
                    if (!request.dimensionValues) {
                        request.dimensionValues = new Map();
                    }
                    request.dimensionValues.set('time', datasetConfig.fixedTime);
                }
                return wpsAnalysisProvider!.getTransectSeries(request);
            },
            maxLineStringLength: 2
        };

        tools.push({
            type: TRANSECT_VALUES_PROCESSING,
            name: 'Values along transect',
            config: transectSeriesConfig
        });
    }

    return tools;
};
