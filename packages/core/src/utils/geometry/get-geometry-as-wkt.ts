import { geojsonToWKT } from '@terraformer/wkt';

import { Geometry } from '../../common';
import { getGeometryAsGeoJSON } from './get-geometry-as-geojson';

export const getGeometryAsWkt = (geometry: Geometry) => {
    return geojsonToWKT(getGeometryAsGeoJSON(geometry));
};
