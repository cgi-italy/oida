import { RasterMapViz } from '@oidajs/eo-mobx';
import { getWcsTimeFilterSubset } from '../utils/get-wcs-time-filter-subset';
import { getAoiWcsParams, getCoverageWcsParams } from '../utils';
import { AdamWcsDatasetConfig } from '../adam-dataset-config';

export const downloadAdamWcsRaster = (datasetConfig: AdamWcsDatasetConfig, rasterView: RasterMapViz) => {
    const subsets: string[] = [];

    if (!datasetConfig.fixedTime) {
        const timeSubset = getWcsTimeFilterSubset(rasterView.dataset.toi);
        if (!timeSubset) {
            return undefined;
        } else {
            subsets.push(timeSubset);
        }
    } else if (datasetConfig.fixedTime instanceof Date) {
        const timeSubset = getWcsTimeFilterSubset(datasetConfig.fixedTime);
        if (timeSubset) {
            subsets.push(timeSubset);
        }
    }

    const aoiParams = getAoiWcsParams(rasterView.dataset.aoi, datasetConfig.coverageExtent, datasetConfig.requestExtentOffset);
    if (aoiParams) {
        subsets.push(...aoiParams.wcsSubsets);
    }

    const wcsCoverage = getCoverageWcsParams(datasetConfig, rasterView.dimensions, rasterView.bandMode);
    if (!wcsCoverage) {
        return undefined;
    }

    const { dimensionSubsets, ...wcsCoverageProps } = wcsCoverage;

    subsets.push(...dimensionSubsets);

    return {
        subsets,
        wktFilter: aoiParams?.wktFilter,
        ...wcsCoverageProps
    };
};
