import { types } from 'mobx-state-tree';
import { MapProjection } from './map-projection';
import { MapViewport } from './map-viewport';

export const MapView = types
    .model('MapView', {
        projection: MapProjection,
        viewport: MapViewport,
        updating: types.optional(types.boolean, false)
    }).actions(self => {
        return {
            setProjection(projection) {
                self.projection = MapProjection.create(projection);
            },
            setViewport(viewport) {
                self.viewport = MapViewport.create(viewport);
            },
            setUpdating(updating) {
                self.updating = updating;
            }
        };
    });
