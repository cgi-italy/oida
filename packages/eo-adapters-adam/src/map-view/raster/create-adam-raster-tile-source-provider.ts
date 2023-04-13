import { transformExtent } from 'ol/proj';

import { AxiosInstanceWithCancellation, TileSource } from '@oidajs/core';
import { RasterMapViz, RasterBandModeSingle, RasterBandModePreset, RasterBandModeCombination, RasterBandMode } from '@oidajs/eo-mobx';

import { ADAM_WCS_SOURCE_ID } from '../adam-wcs-tile-source';
import {
    getWcsTimeFilterSubset,
    getAoiWcsParams,
    getCoverageWcsParams,
    getColormapWcsParams,
    createGeoTiffLoader,
    GeotiffLoader
} from '../../utils';
import { isMultiBandCoverage, AdamDatasetCoverageBand, AdamWcsDatasetConfig } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { AdamSpatialCoverageProvider } from '../../get-adam-dataset-spatial-coverage-provider';

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

export const createAdamRasterTileSourceProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamWcsDatasetConfig,
    spatialCoverageProvider: AdamSpatialCoverageProvider,
    geotiffLoader?: GeotiffLoader
) => {
    const datasetBandsDict: Record<string, AdamDatasetCoverageBand> = {};

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        datasetConfig.coverages.bands.forEach((band) => {
            datasetBandsDict[band.idx] = band;
        });
    }

    const provider = (rasterView: RasterMapViz) => {
        if (datasetConfig.aoiRequired && !rasterView.dataset.aoi) {
            return Promise.reject(new Error('Select an area of interest to visualize data from this layer'));
        }

        const subsets: string[] = [];

        if (!datasetConfig.fixedTime) {
            const timeSubset = getWcsTimeFilterSubset(rasterView.dataset.toi);
            if (!timeSubset) {
                return Promise.reject(new Error('The layer time span is outside of the selected time range'));
            } else {
                subsets.push(timeSubset);
            }
        } else if (datasetConfig.fixedTime instanceof Date) {
            const timeSubset = getWcsTimeFilterSubset(datasetConfig.fixedTime);
            if (timeSubset) {
                subsets.push(timeSubset);
            }
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

        const aoi = rasterView.dataset.aoi;

        return spatialCoverageProvider(rasterView, true).then((coverageExtent) => {
            if (!coverageExtent) {
                return Promise.reject(new Error('Error retrieving coverage data'));
            }
            const aoiParams = getAoiWcsParams(aoi, coverageExtent, datasetConfig.requestExtentOffset);

            if (!aoiParams) {
                return Promise.reject(new Error('The layer extent does not intersect the selected area of interest'));
            }

            let geographicExtent;
            if (aoiParams.extent.srs !== 'EPSG:4326') {
                geographicExtent = transformExtent(aoiParams.extent.bbox, aoiParams.extent.srs, 'EPSG:4326');
            } else {
                geographicExtent = aoiParams.extent.bbox;
            }

            return {
                config: {
                    id: ADAM_WCS_SOURCE_ID,
                    url: factoryConfig.wcsServiceUrl,
                    srs: aoiParams.extent.srs,
                    coverage: wcsCoverageParams.coverageId,
                    format: format,
                    subsets: subsets,
                    subdataset: wcsCoverageParams.subdataset,
                    tileGrid: {
                        extent: aoiParams.extent.bbox,
                        forceUniformResolution: true,
                        tileSize: tileSize
                    },
                    crossOrigin: 'anonymous',
                    wktFilter: aoiParams.wktFilter,
                    tileLoadFunction: tileLoadFunction,
                    colortable: colorTable,
                    colorrange: colorRange,
                    requestExtentOffset: datasetConfig.requestExtentOffset
                } as TileSource,
                geographicExtent: geographicExtent,
                minZoomLevel: datasetConfig.minZoomLevel
            };
        });
    };

    return {
        provider: provider,
        tiffLoader: geotiffLoader
    };
};
