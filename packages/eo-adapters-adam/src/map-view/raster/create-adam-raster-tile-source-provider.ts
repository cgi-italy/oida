import { AxiosInstanceWithCancellation } from '@oida/core';
import {
    RasterMapViz, RasterBandModeSingle, RasterBandModePreset, RasterBandModeCombination, RasterBandMode,
} from '@oida/eo-mobx';
import { createGeoTiffLoader, GeotiffLoader } from '@oida/eo-geotiff';

import { ADAM_WCS_SOURCE_ID } from '../adam-wcs-tile-source';
import { getWcsTimeFilterSubset, getAoiWcsParams, getCoverageWcsParams, getColormapWcsParams } from '../../utils';
import { AdamDatasetConfig, isMultiBandCoverage, AdamDatasetCoverageBand } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';

const getMultiBandColorRange = (
    datasetConfig: AdamDatasetConfig,
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
        const presetConfig = datasetConfig.coverages.presets.find(p => p.id === preset);
        if (presetConfig) {
            const redConfig = datasetBandsDict[presetConfig.bands[0]];
            if (redConfig) {
                let defaultRange = redConfig.default?.range || redConfig.domain;
                colorRange = `(${defaultRange.min},${defaultRange.max})`;
            }
        }
    } else if (bandModeValue instanceof RasterBandModeCombination) {
        const redConfig = datasetBandsDict[bandModeValue.red];
        if (redConfig) {
            let defaultRange = redConfig.default?.range || redConfig.domain;
            colorRange = `(${defaultRange.min},${defaultRange.max})`;
        }
    }

    return colorRange;
};

export const createAdamRasterTileSourceProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    axiosInstance: AxiosInstanceWithCancellation,
    useRawData?: boolean

) => {

    let geotiffLoader: GeotiffLoader | undefined;

    if (useRawData) {
        geotiffLoader = createGeoTiffLoader({axiosInstance, rotateImage: false});
    }

    const datasetBandsDict: Record<string, AdamDatasetCoverageBand> = {};

    if (isMultiBandCoverage(datasetConfig.coverages)) {

        datasetConfig.coverages.bands.forEach((band) => {
            datasetBandsDict[band.idx] = band;
        });
    }

    const provider = (rasterView: RasterMapViz) => {

        let subsets: string[] = [];

        let timeSubset = getWcsTimeFilterSubset(rasterView.dataset.selectedTime);
        if (!timeSubset) {
            return undefined;
        } else {
            subsets.push(timeSubset);
        }

        const aoiParams = getAoiWcsParams(datasetConfig, rasterView.dataset.aoiFilter);
        if (!aoiParams) {
            //the coverage is outside of the currently selected aoi
            return undefined;
        }

        const bandMode = rasterView.bandMode;
        const wcsCoverageParams = getCoverageWcsParams(datasetConfig, rasterView.dimensions, bandMode);
        if (!wcsCoverageParams) {
            return undefined;
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

        return {
            id: ADAM_WCS_SOURCE_ID,
            url: factoryConfig.wcsServiceUrl,
            srs: datasetConfig.coverageSrs,
            coverage: wcsCoverageParams.coverageId,
            minZoomLevel: datasetConfig.minZoomLevel,
            format: format,
            subsets: subsets,
            tileGrid: {
                extent: aoiParams.extent,
                forceUniformResolution: true
            },
            crossOrigin: true,
            wktFilter: aoiParams.wktFilter,
            tileLoadFunction: tileLoadFunction,
            colortable: colorTable,
            colorrange: colorRange,
            requestExtentOffset: datasetConfig.requestExtentOffset
        };
    };

    return {
        provider: provider,
        tiffLoader: geotiffLoader
    };

};
