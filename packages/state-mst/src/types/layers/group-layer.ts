import { types, Instance } from 'mobx-state-tree';

import { GROUP_LAYER_ID } from '@oida/core';

import { MapLayer, MapLayerType } from './map-layer';
import { IndexedCollection } from '../core';
import { EntitySafeReference } from '../entity';
import { ReferenceOrType } from '../mst';

const LayerCollectionDecl = IndexedCollection(
    ReferenceOrType(MapLayerType, EntitySafeReference(MapLayerType)),
    undefined,
    'childLayers'
);


type LayerCollectionType = typeof LayerCollectionDecl;
export interface LayerCollectionInterface extends LayerCollectionType {}
export const LayerCollection: LayerCollectionInterface = LayerCollectionDecl;
export interface ILayerCollection extends Instance<LayerCollectionInterface> {}

const GroupLayerDecl = MapLayer.addModel(
    types.model(GROUP_LAYER_ID, {
        children: types.optional(LayerCollection, {})
    })
);

type GroupLayerType = typeof GroupLayerDecl;
export interface GroupLayerInterface extends GroupLayerType {}
export const GroupLayer: GroupLayerInterface = GroupLayerDecl;
export interface IGroupLayer extends Instance<GroupLayerInterface> {}
