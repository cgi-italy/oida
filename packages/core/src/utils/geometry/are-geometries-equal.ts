import booleanEqual from '@turf/boolean-equal';

import { Geometry } from '../../common';

export const areGeometriesEqual = (firstGeometry: Geometry, secondGeometry: Geometry) => {
    const precision = 6;

    if (firstGeometry.type === 'BBox') {
        if (secondGeometry.type !== 'BBox') {
            return false;
        } else {
            const eps = 1 / precision;
            return firstGeometry.bbox.every((corner, idx) => {
                return Math.abs(corner - secondGeometry.bbox[idx]) < eps;
            });
        }
    } else if (firstGeometry.type === 'Circle') {
        if (secondGeometry.type !== 'Circle') {
            return false;
        } else {
            const eps = 1 / precision;
            return (
                firstGeometry.center.every((coord, idx) => {
                    return Math.abs(coord - secondGeometry.center[idx]) < eps;
                }) && Math.abs(firstGeometry.radius - secondGeometry.radius) < eps
            );
        }
    } else if (firstGeometry.type === 'GeometryCollection' || firstGeometry.type === 'GeometryCollectionEx') {
        if (secondGeometry.type !== 'GeometryCollection' && secondGeometry.type !== 'GeometryCollectionEx') {
            return false;
        } else {
            if (firstGeometry.geometries.length !== secondGeometry.geometries.length) {
                return false;
            } else {
                return (firstGeometry.geometries as Geometry[]).every((geometry, idx) => {
                    return areGeometriesEqual(geometry, secondGeometry.geometries[idx]);
                });
            }
        }
    } else {
        return booleanEqual(firstGeometry, secondGeometry as Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>);
    }
};
