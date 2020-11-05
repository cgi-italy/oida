import { RasterMapViz } from '@oida/eo-mobx';
import { getWcsTimeFilterSubset } from '../utils/get-wcs-time-filter-subset';
import { getAoiWcsParams, getCoverageWcsParams } from '../utils';
import { AdamDatasetConfig } from '../adam-dataset-config';

export const downloadAdamWcsRaster = (datasetConfig: AdamDatasetConfig, rasterView: RasterMapViz) => {

    let subsets: string[] = [];

    let timeSubset = getWcsTimeFilterSubset(rasterView.dataset.selectedTime);
    if (!timeSubset) {
        return undefined;
    } else {
        subsets.push(timeSubset);
    }

    const aoiParams = getAoiWcsParams(datasetConfig, rasterView.dataset.aoiFilter);
    if (!aoiParams) {
        return undefined;
    } else {
        subsets.push(...aoiParams.wcsSubsets);
    }

    const wcsCoverage = getCoverageWcsParams(datasetConfig, rasterView.dimensions, rasterView.bandMode);
    if (!wcsCoverage) {
        return undefined;
    }

    const {dimensionSubsets, ...wcsCoverageProps} = wcsCoverage;

    subsets.push(...dimensionSubsets);

    return {
        subsets,
        wktFilter: aoiParams.wktFilter,
        ...wcsCoverageProps
    };
};
