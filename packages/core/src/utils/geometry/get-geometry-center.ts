import { Geometry } from '../../common';
import { getGeometryExtent } from './get-geometry-extent';

export const getGeometryCenter = (geometry: Geometry) => {
    const extent = getGeometryExtent(geometry);

    if (extent) {
        return [(extent[2] + extent[0]) / 2, (extent[3] + extent[1]) / 2];
    }
};
