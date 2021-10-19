import { DatasetDimensions, RasterBandMode, RasterBandModeSingle, RasterBandModePreset, RasterBandModeCombination } from '@oida/eo-mobx';
import { AdamDatasetConfig, isMultiBandCoverage } from '../adam-dataset-config';

export const getCoverageWcsParams = (datasetConfig: AdamDatasetConfig, dimensions: DatasetDimensions, bandMode: RasterBandMode) => {

    let coverage: string | undefined;
    let bandSubset: string | undefined;
    let dimensionSubsets: string[] = [];
    let subdataset: string | undefined;

    const dimensionSubsetsMap = {} as Record<string, string[]>;
    if (datasetConfig.dimensions) {

        datasetConfig.dimensions.forEach((dimension) => {
            let value = dimensions.values.get(dimension.id);
            if (value && dimension.id === 'subdataset') {
                subdataset = value.toString();
            } else {
                if (value !== undefined) {
                    if (dimension.wcsSubset.idx !== undefined) {
                        let currentSubset = dimensionSubsetsMap[dimension.wcsSubset.id] || [];
                        currentSubset.splice(dimension.wcsSubset.idx, 0, value.toString());
                        dimensionSubsetsMap[dimension.wcsSubset.id] = currentSubset;
                    } else {
                        dimensionSubsetsMap[dimension.wcsSubset.id] = [value.toString()];
                    }
                } else if (dimension.wcsSubset.idx !== undefined) {
                    let currentSubset = dimensionSubsetsMap[dimension.wcsSubset.id] || [];
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
            bandSubset = (`band(${bandModeValue.band})`);
        } else if (bandModeValue instanceof RasterBandModePreset) {
            const preset = bandModeValue.preset;
            const presetConfig = datasetConfig.coverages.presets.find(p => p.id === preset);
            if (presetConfig) {
                bandSubset = (`band(${presetConfig.bands.join(',')})`);
            }
        } else if (bandModeValue instanceof RasterBandModeCombination) {
            bandSubset = (`band(${bandModeValue.red},${bandModeValue.green},${bandModeValue.blue})`);
        }
    } else {
        if (bandModeValue instanceof RasterBandModeSingle) {
            let bandConfig = datasetConfig.coverages.find(coverage => coverage.id === bandModeValue.band);
            if (bandConfig) {
                coverage = bandConfig.wcsCoverage;
                if (bandConfig.wcsSubset) {
                    if (bandConfig.wcsSubset.idx !== undefined) {
                        let currentSubset = dimensionSubsetsMap[bandConfig.wcsSubset.id] || [];
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
        return (`${subsetId}(${dimensionSubsetsMap[subsetId].join(',')})`);
    });


    if (!coverage) {
        return undefined;
    } else {
        return {
            coverageId: coverage,
            bandSubset,
            dimensionSubsets,
            subdataset
        };
    }
};
