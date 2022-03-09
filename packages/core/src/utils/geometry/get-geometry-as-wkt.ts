import bboxPolygon from '@turf/bbox-polygon';
import { geojsonToWKT } from '@terraformer/wkt';

import { Geometry } from '../../common';

export const getGeometryAsWkt = (geometry: Geometry) => {
    if (geometry.type === 'BBox') {
        geometry = bboxPolygon(geometry.bbox).geometry;
    }
    return geojsonToWKT(geometry);
};
