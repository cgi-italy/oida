import { AxiosInstanceWithCancellation, TileSource } from '@oidajs/core';

import {
    DatasetVerticalProfileViz,
    RasterBandMode,
    RasterBandModeCombination,
    RasterBandModePreset,
    RasterBandModeSingle
} from '@oidajs/eo-mobx';

import { createGeoTiffLoader, getColormapWcsParams, getCoverageWcsParams } from '../../utils';
import { ADAM_WCS_SOURCE_ID } from '../adam-wcs-tile-source';
import { AdamDatasetCoverageBand, AdamWcsDatasetConfig, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { AdamWcsVerticalProfileDataProvider } from './adam-wcs-vertical-profile-data-provider';

const getMultiBandColorRange = (
    datasetConfig: AdamWcsDatasetConfig,
    bandMode: RasterBandMode,
    datasetBandsDict: Record<string, AdamDatasetCoverageBand>
) => {
    if (!isMultiBandCoverage(datasetConfig.coverages)) {
        return undefined;
    }

    let colorRange: string | undefined;

    const bandModeValue = bandMode.value;
    if (bandModeValue instanceof RasterBandModePreset) {
        const preset = bandModeValue.preset;
        const presetConfig = datasetConfig.coverages.presets.find((p) => p.id === preset);
        if (presetConfig) {
            const redConfig = datasetBandsDict[presetConfig.bands[0]];
            if (redConfig) {
                const defaultRange = redConfig.default?.range || redConfig.domain || { min: 0, max: 100 };
                colorRange = `(${defaultRange.min},${defaultRange.max})`;
            }
        }
    } else if (bandModeValue instanceof RasterBandModeCombination) {
        const redConfig = datasetBandsDict[bandModeValue.red];
        if (redConfig) {
            const defaultRange = redConfig.default?.range || redConfig.domain || { min: 0, max: 100 };
            colorRange = `(${defaultRange.min},${defaultRange.max})`;
        }
    }

    return colorRange;
};

export const createAdamVerticalProfileTileSourceProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamWcsDatasetConfig,
    axiosInstance: AxiosInstanceWithCancellation,
    wcsProvider: AdamWcsVerticalProfileDataProvider
) => {
    const geotiffLoader = createGeoTiffLoader({ axiosInstance, rotateImage: true });

    const datasetBandsDict: Record<string, AdamDatasetCoverageBand> = {};

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        datasetConfig.coverages.bands.forEach((band) => {
            datasetBandsDict[band.idx] = band;
        });
    }

    const tileSourceProvider = (vProfileViz: DatasetVerticalProfileViz, profileId: string) => {
        const subsets: string[] = [];

        const bandMode = vProfileViz.bandMode;
        const wcsCoverageParams = getCoverageWcsParams(datasetConfig, vProfileViz.dimensions, bandMode);
        if (!wcsCoverageParams) {
            return Promise.reject(new Error('Unsupported coverage'));
        }

        if (wcsCoverageParams.bandSubset) {
            subsets.push(wcsCoverageParams.bandSubset);
        }
        subsets.push(...wcsCoverageParams.dimensionSubsets);

        let format: string;
        let tileLoadFunction: ((tile, source) => void) | undefined = undefined;
        let colorTable: string | undefined;
        let colorRange: string | undefined;

        if (geotiffLoader && bandMode.value instanceof RasterBandModeSingle) {
            format = 'image/tiff';
            tileLoadFunction = geotiffLoader.load;
        } else {
            format = 'image/png';
            const colorMapParams = getColormapWcsParams(bandMode);
            colorTable = colorMapParams.colorTable;
            colorRange = colorMapParams.colorRange;
            if (!colorRange && !(bandMode.value instanceof RasterBandModeSingle)) {
                colorRange = getMultiBandColorRange(datasetConfig, bandMode, datasetBandsDict);
            }
        }

        return wcsProvider.getProfileMetadata(profileId).then((profile) => {
            const extent = [0, 0, profile.dimensions[1], profile.dimensions[0]];

            const timeSubset = `unix(${profile.time.toISOString()})`;

            const extentWidth = extent[2] - extent[0];
            const extentHeight = extent[3] - extent[1];
            const gridSize =
                extentWidth > extentHeight ? [Math.round(extentWidth / extentHeight), 1] : [1, Math.round(extentHeight / extentWidth)];

            return {
                id: ADAM_WCS_SOURCE_ID,
                url: factoryConfig.wcsServiceUrl,
                srs: 'unprojected',
                coverage: wcsCoverageParams.coverageId,
                subdataset: wcsCoverageParams.subdataset,
                format: format,
                subsets: [...subsets, timeSubset],
                tileGrid: {
                    extent: extent,
                    gridSize: gridSize
                },
                tileLoadFunction: tileLoadFunction,
                colortable: colorTable,
                colorrange: colorRange
            } as TileSource;
        });
    };

    return {
        tileSourceProvider,
        geotiffLoader
    };
};
