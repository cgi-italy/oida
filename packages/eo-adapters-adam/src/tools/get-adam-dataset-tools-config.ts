import React from 'react';

import { AxiosInstanceWithCancellation } from '@oida/core';
import {
    DIMENSION_SERIES_TYPE, DatasetDimensionSeriesConfig, DatasetTimeDistributionProvider, DatasetToolConfig,
    // DIMENSION_RASTER_SEQUENCE_TYPE, DatasetRasterSequenceConfig,
    // TRANSECT_SERIES_TYPE, DatasetTransectSeriesConfig, isValueDomain, ColormapConfigMode, ColorMapConfig,
} from '@oida/eo-mobx';

import { AdamDatasetConfig, AdamDatasetCoverageBand, AdamDatasetSingleBandCoverage, isMultiBandCoverage, AdamDatasetDimension } from '../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../get-adam-dataset-factory';
// import { getAdamDatasetColorMapConfig } from '../get-adam-dataset-colormap-config';
import { AdamWcsSeriesProvider } from './adam-wcs-series-provider';
// import { AdamWpsAnalysisProvider } from './adam-wps-analysis-provider';
// import { AdamWcsRasterVolumeProvider } from './adam-wcs-raster-volume-provider';
// import { getPlottyColormaps } from '../../utils';

export const getAdamDatasetToolsConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    timeDistributionProvider?: DatasetTimeDistributionProvider
) => {


    const variables: AdamDatasetSingleBandCoverage[] = [];

    const dimensions = datasetConfig.dimensions ? datasetConfig.dimensions.slice() : [];

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        const bandDimension: AdamDatasetDimension = {
            id: 'band',
            name: 'Band',
            wcsSubset: {
                id: 'band'
            },
            wcsResponseKey: '',
            tarFilenameRegex: /band\(([^\)]*)\)/,
            domain: datasetConfig.coverages.bands.map((band) => {
                return {
                    label: band.name,
                    value: band.idx
                };
            })
        };
        dimensions.push(bandDimension);

        let bandsDomain = {
            min: Number.MAX_VALUE,
            max: -Number.MAX_VALUE
        };

        datasetConfig.coverages.bands.forEach((band) => {
            bandsDomain.min = Math.min(bandsDomain.min, band.domain.min);
            bandsDomain.max = Math.max(bandsDomain.max, band.domain.max);
        });

        variables.push({
            id: `${datasetConfig.id}_band_value`,
            name: 'Band value',
            wcsCoverage: datasetConfig.coverages.wcsCoverage,
            domain: bandsDomain
        });

    } else {
        variables.push(...datasetConfig.coverages);
    }

    const timeDimension: AdamDatasetDimension = {
        id: 'time',
        name: 'Time',
        wcsSubset: {
            id: 'unix'
        },
        wcsResponseKey: 'time',
        tarFilenameRegex: /([0-9]{4})([0-9]{2})([0-9]{2})\.([0-9]{2})([0-9]{2})([0-9]{2})/,
        domain: timeDistributionProvider ? () => {
            return timeDistributionProvider!.getTimeExtent().then((extent) => {
                return {
                    min: extent?.start || new Date(0),
                    max: extent?.end || new Date()
                };
            });
        } : undefined
    };

    if (!datasetConfig.fixedTime) {
        dimensions.unshift(timeDimension);
    }

    let wcsSeriesProvider = new AdamWcsSeriesProvider({
        axiosInstance: axiosInstance,
        coverageSrs: datasetConfig.coverageSrs,
        serviceUrl: factoryConfig.wcsServiceUrl,
        extentOffset: datasetConfig.requestExtentOffset,
        variables: variables,
        dimensions: dimensions
    });

    let dimensionSeriesToolConfig: DatasetDimensionSeriesConfig = {
        supportedGeometries: [{
            type: 'Point'
        }, {
            type: 'BBox'
        }],
        variables: variables,
        dimensions: dimensions,
        provider: (request) => {
            return wcsSeriesProvider.getSeries(request);
        }
    };

    let tools: DatasetToolConfig[] = [];

    tools.push({
        type: DIMENSION_SERIES_TYPE,
        name: 'Series analysis',
        config: dimensionSeriesToolConfig
    });

    return tools;

};
