import { types, Instance } from 'mobx-state-tree';

import { FEATURE_LAYER_ID } from '@oida/core';

import { MapLayer } from './map-layer';
import { FunctionType } from '../mst/function-type';
import { getEntityCollectionType } from '../entity/entity-collection';
import { ReferenceOrType } from '../mst/reference-or-type';

const FeatureLayerDecl = MapLayer.addModel(
    types.model(FEATURE_LAYER_ID, {
        config: types.frozen(),
        source: ReferenceOrType(getEntityCollectionType()),
        geometryGetter: types.maybe(FunctionType),
        styleGetter: types.maybe(FunctionType)
    })
    .actions((self) => {
        return {
            setGeometryGetter: (geometryGetter) => {
                self.geometryGetter = geometryGetter;
            },
            setStyleGetter: (styleGetter) => {
                self.styleGetter = styleGetter;
            },
            setSource: (source) => {
                self.source = source;
            }
        };
    })
);

type FeatureLayerType = typeof FeatureLayerDecl;
export interface FeatureLayerInterface extends FeatureLayerType {}
export const FeatureLayer: FeatureLayerInterface = FeatureLayerDecl;
export interface IFeatureLayer extends Instance<FeatureLayerInterface> {}

