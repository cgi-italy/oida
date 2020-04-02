import { types, Instance } from 'mobx-state-tree';

import { VERTICAL_PROFILE_LAYER_ID, IVerticalProfile, IVerticalProfileStyle } from '@oida/core';

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
        source: ReferenceOrType(getEntityCollectionType())
    }), hasConfig<VerticalProfileLayerConfig>())
    .actions((self) => {
        return {
            setSource: (source) => {
                self.source = source;
            }
        };
    })
);

type VerticalProfileLayerType = typeof VerticalProfileLayerDecl;
export interface VerticalProfileLayerInterface extends VerticalProfileLayerType {}
export const VerticalProfileLayer: VerticalProfileLayerInterface = VerticalProfileLayerDecl;
export interface IVerticalProfileLayer extends Instance<VerticalProfileLayerInterface> {}

