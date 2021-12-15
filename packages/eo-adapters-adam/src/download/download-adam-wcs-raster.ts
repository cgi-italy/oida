import { RasterMapViz } from '@oidajs/eo-mobx';
import { getWcsTimeFilterSubset } from '../utils/get-wcs-time-filter-subset';
import { getAoiWcsParams, getCoverageWcsParams } from '../utils';
import { AdamDatasetConfig } from '../adam-dataset-config';

export const downloadAdamWcsRaster = (datasetConfig: AdamDatasetConfig, rasterView: RasterMapViz) => {

    const subsets: string[] = [];

    if (!datasetConfig.timeless) {
        const timeSubset = getWcsTimeFilterSubset(rasterView.dataset.toi);
        if (!timeSubset) {
            return undefined;
        } else {
            subsets.push(timeSubset);
        }
    }

    const aoiParams = getAoiWcsParams(datasetConfig, rasterView.dataset.aoi);
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
