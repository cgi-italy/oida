import { types, SnapshotIn, Instance } from 'mobx-state-tree';

import { MapView } from './map-view';
import { MapRenderer } from './map-renderer';
import { GroupLayer } from '../layers/group-layer';
import { MapInteractionCollection } from '../interactions/map-interaction';
import { IndexedCollection } from '../core/indexed-collection';

export const MapDecl = types.model('Map', {
    layers: types.optional(GroupLayer, {id: 'rootGroup'}),
    interactions: types.optional(MapInteractionCollection, {}),
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

type MapType = typeof MapDecl;
export interface MapInterface extends MapType {}
export const Map: MapInterface = MapDecl;
export interface IMap extends Instance<MapInterface> {}
