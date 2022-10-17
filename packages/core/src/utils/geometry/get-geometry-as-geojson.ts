import bboxPolygon from '@turf/bbox-polygon';
import circle from '@turf/circle';

import { Geometry } from '../../common';

export type GeometryAsGeoJSONOptions = {
    circleApproxSteps?: number;
};

export const getGeometryAsGeoJSON = (geometry: Geometry, options?: GeometryAsGeoJSONOptions): GeoJSON.Geometry => {
    if (geometry.type === 'BBox') {
        return bboxPolygon(geometry.bbox).geometry;
    } else if (geometry.type === 'Circle') {
        return circle(geometry.center, geometry.radius / 1000, {
            units: 'kilometers',
            steps: options?.circleApproxSteps
        }).geometry;
    } else if (geometry.type === 'GeometryCollectionEx') {
        return {
            type: 'GeometryCollection',
            geometries: geometry.geometries.map((geometry) => getGeometryAsGeoJSON(geometry))
        };
    } else {
        return geometry;
    }
};
