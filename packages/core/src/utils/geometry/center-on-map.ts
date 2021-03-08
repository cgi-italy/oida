import bboxPolygon from '@turf/bbox-polygon';
import booleanDisjoint from '@turf/boolean-disjoint';

import { Geometry } from '../../common';
import { IMapRenderer, BBox } from '../../map-render';
import { getGeometryExtent } from './get-geometry-extent';

export type CenterOnMapOptions = {
    notIfInViewport?: boolean;
    animate?: boolean;
};

export const centerOnMap = (renderer: IMapRenderer, geometry: Geometry, options: CenterOnMapOptions = {}) => {

    let extent = getGeometryExtent(geometry);

    if (!extent) {
        return;
    }

    if (options.notIfInViewport) {

        if (!booleanDisjoint(
            bboxPolygon(renderer.getViewportExtent()),
            bboxPolygon(extent)
        )) {
            return;
        }
    }

    renderer.fitExtent(extent as BBox, options.animate);
};
