import { transformExtent } from 'ol/proj';
import { getIntersection, isEmpty } from 'ol/extent';

import { getGeometryExtent } from '@oidajs/core';
import { AoiValue } from '@oidajs/core';

import { AdamWcsDatasetConfig } from '../adam-dataset-config';

export const getAoiWcsParams = (
    datasetConfig: AdamWcsDatasetConfig,
    aoiFilter: AoiValue | undefined,
    currentCoverageExtent?: { bbox: number[]; srs: string }
) => {
    let extent = currentCoverageExtent || datasetConfig.coverageExtent;
    if (extent) {
        // deep clone to avoid side effects
        extent = {
            bbox: [...extent.bbox],
            srs: extent.srs
        };
    }

    let wktFilter: string | undefined;
    let wcsSubsets: string[] = [];

    if (aoiFilter) {
        const geometry = aoiFilter.geometry;
        let filterExtent = getGeometryExtent(geometry);
        if (filterExtent) {
            if (extent) {
                filterExtent = transformExtent(filterExtent, 'EPSG:4326', extent.srs);
                extent.bbox = getIntersection(extent.bbox, filterExtent);
            } else {
                extent = {
                    bbox: filterExtent,
                    srs: 'EPSG:4326'
                };
            }
        }

        if (!extent || isEmpty(extent.bbox)) {
            return undefined;
        }

        if (geometry.type === 'Polygon') {
            const polygonCoords = geometry.coordinates[0]
                .map((coord) => {
                    return `${coord[0]} ${coord[1]}`;
                })
                .join(',');

            wktFilter = `geometry=POLYGON((${polygonCoords}))`;
        }
        if (datasetConfig.requestExtentOffset) {
            extent.bbox[0] += datasetConfig.requestExtentOffset[0];
            extent.bbox[2] += datasetConfig.requestExtentOffset[0];
            extent.bbox[1] += datasetConfig.requestExtentOffset[1];
            extent.bbox[3] += datasetConfig.requestExtentOffset[1];
        }
        if (extent.srs === 'EPSG:4326') {
            wcsSubsets = [`Lon(${extent.bbox[0]},${extent.bbox[2]})`, `Lat(${extent.bbox[1]},${extent.bbox[3]})`];
        } else {
            wcsSubsets = [`E(${extent.bbox[0]},${extent.bbox[2]})`, `N(${extent.bbox[1]},${extent.bbox[3]})`];
        }
    }

    if (!extent) {
        return undefined;
    }

    return {
        extent,
        wcsSubsets,
        wktFilter
    };
};
