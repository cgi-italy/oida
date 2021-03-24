import { transformExtent } from 'ol/proj';

import { AxiosInstanceWithCancellation } from '@oida/core';
import {
    RasterMapViz, RasterBandModeSingle, RasterBandModePreset, RasterBandModeCombination, RasterBandMode
} from '@oida/eo-mobx';

import { ADAM_WCS_SOURCE_ID } from '../adam-wcs-tile-source';
import { getWcsTimeFilterSubset, getAoiWcsParams, getCoverageWcsParams, getColormapWcsParams, createGeoTiffLoader, GeotiffLoader } from '../../utils';
import { AdamDatasetConfig, isMultiBandCoverage, AdamDatasetCoverageBand } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { AdamSpatialCoverageProvider } from '../../get-adam-dataset-spatial-coverage-provider';

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
                let defaultRange = redConfig.default?.range || redConfig.domain || {min: 0, max: 100};
                colorRange = `(${defaultRange.min},${defaultRange.max})`;
            }
        }
    } else if (bandModeValue instanceof RasterBandModeCombination) {
        const redConfig = datasetBandsDict[bandModeValue.red];
        if (redConfig) {
            let defaultRange = redConfig.default?.range || redConfig.domain || {min: 0, max: 100};
            colorRange = `(${defaultRange.min},${defaultRange.max})`;
        }
    }

    return colorRange;
};

export const createAdamRasterTileSourceProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig,
    axiosInstance: AxiosInstanceWithCancellation,
    spatialCoverageProvider: AdamSpatialCoverageProvider,
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
            return Promise.reject(new Error('The layer time span is outside of the selected time range'));
        } else {
            subsets.push(timeSubset);
        }

        const aoiParams = getAoiWcsParams(datasetConfig, rasterView.dataset.aoiFilter);
        if (!aoiParams) {
            return Promise.reject(new Error('The layer extent does not intersect the selected area of interest'));
        }

        const bandMode = rasterView.bandMode;
        const wcsCoverageParams = getCoverageWcsParams(datasetConfig, rasterView.dimensions, bandMode);
        if (!wcsCoverageParams) {
            return Promise.resolve(undefined);
        }

        if (wcsCoverageParams.bandSubset) {
            subsets.push(wcsCoverageParams.bandSubset);
        }
        subsets.push(...wcsCoverageParams.dimensionSubsets);

        let format: string;
        let tileSize = 256;
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
            // for non geotiff data use a bigger tile size to reduce the number of requests
            tileSize = 384;
            if (!colorRange && !(bandMode.value instanceof RasterBandModeSingle)) {
                colorRange = getMultiBandColorRange(datasetConfig, bandMode, datasetBandsDict);
            }
        }

        return spatialCoverageProvider(rasterView, true).then((coverageExtent) => {
            const aoiParams = getAoiWcsParams(datasetConfig, rasterView.dataset.aoiFilter, coverageExtent);

            if (!aoiParams) {
                return Promise.reject(new Error('The layer extent does not intersect the selected area of interest'));
            }

            let geographicExtent;
            if (datasetConfig.coverageSrs !== 'EPSG:4326') {
                geographicExtent = transformExtent(aoiParams.extent, datasetConfig.coverageSrs, 'EPSG:4326');
            } else {
                geographicExtent = aoiParams.extent;
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
                    forceUniformResolution: true,
                    tileSize: tileSize
                },
                extent: geographicExtent,
                crossOrigin: true,
                wktFilter: aoiParams.wktFilter,
                tileLoadFunction: tileLoadFunction,
                colortable: colorTable,
                colorrange: colorRange,
                requestExtentOffset: datasetConfig.requestExtentOffset
            };
        });
    };

    return {
        provider: provider,
        tiffLoader: geotiffLoader
    };

};
