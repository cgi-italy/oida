import { DatasetDimensions, RasterBandMode, RasterBandModeSingle, RasterBandModePreset, RasterBandModeCombination } from '@oidajs/eo-mobx';
import { AdamWcsDatasetConfig, isMultiBandCoverage } from '../adam-dataset-config';

export const getCoverageWcsParams = (datasetConfig: AdamWcsDatasetConfig, dimensions: DatasetDimensions, bandMode: RasterBandMode) => {
    let coverage: string | undefined;
    let bandSubset: string | undefined;
    let dimensionSubsets: string[] = [];
    let subdataset: string | undefined;

    const dimensionSubsetsMap: Record<string, string[]> = {};
    const categoricalDimensionRanges: Record<string, string[]> = {};
    if (datasetConfig.dimensions) {
        datasetConfig.dimensions.forEach((dimension) => {
            const value = dimensions.values.get(dimension.id);
            if (value && dimension.id === 'subdataset') {
                subdataset = value.toString();
            } else {
                if (value !== undefined) {
                    if (dimension.wcsSubset.idx !== undefined) {
                        const currentSubset = dimensionSubsetsMap[dimension.wcsSubset.id] || [];
                        currentSubset.splice(dimension.wcsSubset.idx, 0, value.toString());
                        dimensionSubsetsMap[dimension.wcsSubset.id] = currentSubset;
                    } else {
                        dimensionSubsetsMap[dimension.wcsSubset.id] = [value.toString()];
                    }
                } else if (dimensions.ranges.has(dimension.id)) {
                    const range = dimensions.ranges.get(dimension.id);
                    if (Array.isArray(range)) {
                        // there is no way of subsetting a categorical dimension using multiple values
                        // just pass the subset range outside and let the caller handle it
                        categoricalDimensionRanges[dimension.wcsSubset.id] = range.map((value) => {
                            return value.toString();
                        });
                    } else if (range) {
                        dimensionSubsetsMap[dimension.wcsSubset.id] = [`${range.min},${range.max}`];
                    }
                } else if (dimension.wcsSubset.idx !== undefined) {
                    const currentSubset = dimensionSubsetsMap[dimension.wcsSubset.id] || [];
                    currentSubset.splice(dimension.wcsSubset.idx, 0, '*');
                    dimensionSubsetsMap[dimension.wcsSubset.id] = currentSubset;
                }
            }
        });
    }

    const bandModeValue = bandMode.value;
    if (isMultiBandCoverage(datasetConfig.coverages)) {
        coverage = datasetConfig.coverages.wcsCoverage;
        if (bandModeValue instanceof RasterBandModeSingle) {
            bandSubset = `band(${bandModeValue.band})`;
        } else if (bandModeValue instanceof RasterBandModePreset) {
            const preset = bandModeValue.preset;
            const presetConfig = datasetConfig.coverages.presets.find((p) => p.id === preset);
            if (presetConfig) {
                bandSubset = `band(${presetConfig.bands.join(',')})`;
            }
        } else if (bandModeValue instanceof RasterBandModeCombination) {
            bandSubset = `band(${bandModeValue.red},${bandModeValue.green},${bandModeValue.blue})`;
        }
    } else {
        if (bandModeValue instanceof RasterBandModeSingle) {
            const bandConfig = datasetConfig.coverages.find((coverage) => coverage.id === bandModeValue.band);
            if (bandConfig) {
                coverage = bandConfig.wcsCoverage;
                if (bandConfig.wcsSubset) {
                    if (bandConfig.wcsSubset.idx !== undefined) {
                        const currentSubset = dimensionSubsetsMap[bandConfig.wcsSubset.id] || [];
                        currentSubset.splice(bandConfig.wcsSubset.idx, 0, bandConfig.wcsSubset.value);
                        dimensionSubsetsMap[bandConfig.wcsSubset.id] = currentSubset;
                    } else {
                        dimensionSubsetsMap[bandConfig.wcsSubset.id] = [bandConfig.wcsSubset.value];
                    }
                }
                if (bandConfig.subdataset) {
                    subdataset = bandConfig.subdataset;
                }
            }
        }
    }

    dimensionSubsets = Object.keys(dimensionSubsetsMap).map((subsetId) => {
        return `${subsetId}(${dimensionSubsetsMap[subsetId].join(',')})`;
    });

    if (!coverage) {
        return undefined;
    } else {
        return {
            coverageId: coverage,
            bandSubset,
            dimensionSubsets,
            subdataset,
            categoricalDimensionRanges
        };
    }
};
