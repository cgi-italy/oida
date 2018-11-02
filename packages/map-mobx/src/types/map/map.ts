import { types, SnapshotIn, Instance } from 'mobx-state-tree';

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
        setRenderer(renderer: SnapshotIn<typeof MapRenderer>) {
            self.renderer = MapRenderer.create(renderer);
        }
    };
});

export type IMap = Instance<typeof Map>;
