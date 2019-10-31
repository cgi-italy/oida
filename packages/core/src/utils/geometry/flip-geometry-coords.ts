
import flip from '@turf/flip';

import { Geometry } from '../../types';


export const flipGeometryCoords = (geometry: Geometry) => {
    if (geometry.type === 'GeometryCollectionEx') {
        return {
            type: geometry.type,
            geometries: geometry.geometries.map((geometry) => {
                flipGeometryCoords(geometry);
            })
        };
    }
    if (geometry.type === 'BBox') {
        let bbox = geometry.bbox;
        return {
            type: 'BBox',
            bbox: [bbox[1], bbox[0], bbox[3], bbox[2]]
        };
    } else if (geometry.type === 'Circle') {
        return {
            ...geometry,
            center: [geometry.center[1], geometry.center[0]]
        };
    } else {
        // @ts-ignore
        return flip(geometry);
    }

};
