import { transformExtent } from 'ol/proj';
import { getIntersection, isEmpty } from 'ol/extent';

import { getGeometryExtent } from '@oidajs/core';
import { AoiValue } from '@oidajs/core';

import { AdamDatasetConfig } from '../adam-dataset-config';

export const getAoiWcsParams = (datasetConfig: AdamDatasetConfig, aoiFilter: AoiValue | undefined, currentCoverageExtent?: number[]) => {
    let extent: number[] = currentCoverageExtent || datasetConfig.coverageExtent.slice();
    let wktFilter: string | undefined;
    let wcsSubsets: string[] = [];

    if (aoiFilter) {
        const geometry = aoiFilter.geometry;
        let filterExtent = getGeometryExtent(geometry);
        filterExtent = transformExtent(filterExtent, 'EPSG:4326', datasetConfig.coverageSrs);
        extent = getIntersection(extent, filterExtent);

        if (isEmpty(extent)) {
            return undefined;
        }

        if (geometry.type === 'Polygon') {
            const polygonCoords = geometry.coordinates[0]
                .map((coord) => {
                    return `${coord[0]} ${coord[1]}`;
                })
                .join(',');

            wktFilter = `geometry=POLYGON((${polygonCoords}))`;
        } else {
            const requestExtent = extent.slice();
            if (datasetConfig.requestExtentOffset) {
                requestExtent[0] += datasetConfig.requestExtentOffset[0];
                requestExtent[2] += datasetConfig.requestExtentOffset[0];
                requestExtent[1] += datasetConfig.requestExtentOffset[1];
                requestExtent[3] += datasetConfig.requestExtentOffset[1];
            }
            wcsSubsets = [`E(${requestExtent[0]},${requestExtent[2]})`, `N(${requestExtent[1]},${requestExtent[3]})`];
        }
    }

    return {
        extent,
        wcsSubsets,
        wktFilter
    };
};
