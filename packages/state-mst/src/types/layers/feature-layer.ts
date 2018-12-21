import { types, Instance } from 'mobx-state-tree';

import { FEATURE_LAYER_ID } from '@oida/core';

import { LayerType } from './map-layer';
import { FunctionType } from '../mst/function-type';
import { getMapEntityCollectionType } from '../map/map-entity-collection';
import { ReferenceOrType } from '../mst/reference-or-type';

export const FeatureLayer = LayerType.addType(FEATURE_LAYER_ID,
    types.model('FeatureLayer', {
        config: types.frozen(),
        source: ReferenceOrType(getMapEntityCollectionType()),
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

export type IFeatureLayer = Instance<typeof FeatureLayer>;
