import { transformExtent } from 'ol/proj';
import { getIntersection, isEmpty } from 'ol/extent';

import { BBox, getGeometryExtent, AoiValue } from '@oidajs/core';

export const getAoiWcsParams = (
    aoiFilter?: AoiValue | undefined,
    coverageExtent?: { bbox: number[]; srs: string },
    requestExtentOffset?: number[]
) => {
    let extent = coverageExtent
        ? {
              bbox: [...coverageExtent.bbox],
              srs: coverageExtent.srs
          }
        : undefined;

    let wktFilter: string | undefined;
    let wcsSubsets: string[] = [];

    if (aoiFilter) {
        const geometry = aoiFilter.geometry;
        let filterExtent = getGeometryExtent(geometry);
        if (filterExtent) {
            if (extent) {
                filterExtent = transformExtent(filterExtent, 'EPSG:4326', extent.srs) as BBox;
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
        if (requestExtentOffset) {
            extent.bbox[0] += requestExtentOffset[0];
            extent.bbox[2] += requestExtentOffset[0];
            extent.bbox[1] += requestExtentOffset[1];
            extent.bbox[3] += requestExtentOffset[1];
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
