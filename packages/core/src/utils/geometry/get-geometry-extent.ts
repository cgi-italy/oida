
import bbox from '@turf/bbox';
import circle from '@turf/circle';

import { Geometry } from '../../types';

export const circleApproxSteps = 50;

const mergeExtents = (firstExtent, secondExtent) => {
    if (!firstExtent) {
        return secondExtent;
    } else if (!secondExtent) {
        return firstExtent;
    } else {
        return [
            Math.min(firstExtent[0]), secondExtent[0],
            Math.min(firstExtent[1], secondExtent[1]),
            Math.max(firstExtent[2], secondExtent[2]),
            Math.max(firstExtent[3], secondExtent[3])
        ];
    }
};


export const getGeometryExtent = (geometry: Geometry) => {
    if (geometry.type === 'GeometryCollectionEx') {
        return geometry.geometries.reduce((extent, geom) => {
            return mergeExtents(extent, getGeometryExtent(geom));
        }, null);
    }
    if (geometry.type === 'BBox') {
        return geometry.bbox;
    } else if (geometry.type === 'Circle') {
        geometry = circle(geometry.center, geometry.radius / 1000, {
            units: 'kilometers',
            steps: circleApproxSteps
        });
    }

    return bbox(geometry);
};