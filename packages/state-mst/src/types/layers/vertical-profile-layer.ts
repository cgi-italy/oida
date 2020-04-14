import { types, Instance } from 'mobx-state-tree';

import { VERTICAL_PROFILE_LAYER_ID, IVerticalProfile, IVerticalProfileStyle, VerticalProfileCoordinate } from '@oida/core';

import { MapLayer } from './map-layer';

import { getEntityCollectionType } from '../entity/entity-collection';
import { hasConfig } from '../mixins';

import { ReferenceOrType } from '../mst';

export type VerticalProfileLayerConfig = {
    profileGetter: (entity) => IVerticalProfile,
    styleGetter: (entity) => IVerticalProfileStyle
};

const VerticalProfileLayerDecl = MapLayer.addModel(
    types.compose(VERTICAL_PROFILE_LAYER_ID, types.model({
        source: ReferenceOrType(getEntityCollectionType()),
        highlightedCoordinate: types.maybe(types.frozen<VerticalProfileCoordinate>()),
        selectedCoordinate: types.maybe(types.frozen<VerticalProfileCoordinate>()),
        highlightedRegion: types.maybe(types.frozen<GeoJSON.BBox>())
    }), hasConfig<VerticalProfileLayerConfig>())
    .actions((self) => {
        return {
            setSource: (source) => {
                self.source = source;
            },
            setHighlihgtedCoordinate: (coord: VerticalProfileCoordinate | undefined) => {
                self.highlightedCoordinate = coord;
            },
            setSelectedCoordinate: (coord: VerticalProfileCoordinate | undefined) => {
                self.selectedCoordinate = coord;
            },
            setHighlightedRegion: (bbox) => {
                self.highlightedRegion = bbox;
            }
        };
    })
);

type VerticalProfileLayerType = typeof VerticalProfileLayerDecl;
export interface VerticalProfileLayerInterface extends VerticalProfileLayerType {}
export const VerticalProfileLayer: VerticalProfileLayerInterface = VerticalProfileLayerDecl;
export interface IVerticalProfileLayer extends Instance<VerticalProfileLayerInterface> {}

