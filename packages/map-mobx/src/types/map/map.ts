import { types } from 'mobx-state-tree';

import { MapView } from './map-view';
import { MapRenderer } from './map-renderer';
import { GroupLayer } from '../layers/group-layer';

export const Map = types.model('Map', {
    layers: types.optional(GroupLayer, {id: 'rootGroup'}),
    renderer: MapRenderer,
    view: MapView
})
.actions(self => {
    return {
        setRenderer(renderer) {
            self.renderer = MapRenderer.create(renderer);
        }
    };
});
