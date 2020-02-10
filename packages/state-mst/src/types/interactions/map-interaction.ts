import { types, Instance } from 'mobx-state-tree';

import { IndexedCollection } from '../core';
import { TaggedUnion } from '../mst/tagged-union';
import { isActivable } from '../mixins';

const MapInteractionBase = types.compose(
    'MapInteraction',
    types.model({
        id: types.identifier
    }),
    isActivable,
);

export const MapInteraction = TaggedUnion('mapInteractionType', MapInteractionBase);

type MapInteractionType = typeof MapInteraction.Type;
export interface MapInteractionInterface extends MapInteractionType {}
export const MapInteractionType: MapInteractionInterface = MapInteraction.Type;
export interface IMapInteraction extends Instance<MapInteractionInterface> {}

const MapInteractionCollectionDecl = IndexedCollection(MapInteractionType);
type MapInteractionCollectionType = typeof MapInteractionCollectionDecl;
export interface MapInteractionCollectionInterface extends MapInteractionCollectionType {}
export const MapInteractionCollection: MapInteractionCollectionInterface = MapInteractionCollectionDecl;
export interface IMapInteractionCollection extends Instance<MapInteractionCollectionInterface> {}
