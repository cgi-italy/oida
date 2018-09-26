import { types } from 'mobx-state-tree';

import { FEATURE_LAYER_ID } from '@cgi-eo/map-core';

import { LayerType } from './map-layer';
import { FunctionType } from '../mobx/function-type';
import { MapEntityCollection } from '../map-entity/map-entity-collection';
import { ReferenceOrType } from '../mobx/reference-or-type';

export const FeatureLayer = LayerType.addType(FEATURE_LAYER_ID,
    types.model({
        config: types.frozen(),
        source: ReferenceOrType(MapEntityCollection()),
        geometryGetter: FunctionType,
        styleGetter: FunctionType
    })
    .actions((self) => {
        return {
            setGeoemtryGetter: (geometryGetter) => {
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
    .named('FeatureLayer')
);
