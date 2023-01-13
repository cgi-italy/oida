import bboxPolygon from '@turf/bbox-polygon';
import booleanDisjoint from '@turf/boolean-disjoint';

import { Geometry } from '../../common';
import { IMapRenderer, BBox } from '../../map-render';
import { getGeometryExtent } from './get-geometry-extent';

export type CenterOnMapOptions = {
    notIfInViewport?: boolean;
    animate?: boolean;
    pitch?: number;
    rotation?: number;
    padding?: number[];
};

export const centerOnMap = (renderer: IMapRenderer, geometry: Geometry, options: CenterOnMapOptions = {}) => {
    const extent = getGeometryExtent(geometry);

    if (!extent) {
        return;
    }

    if (options.notIfInViewport) {
        const viewportExtent = renderer.getViewportExtent();
        if (viewportExtent && !booleanDisjoint(bboxPolygon(viewportExtent), bboxPolygon(extent))) {
            return;
        }
    }

    renderer.fitExtent(extent as BBox, options);
};
