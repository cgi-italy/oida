import { types, Instance } from 'mobx-state-tree';

import { FEATURE_DRAW_INTERACTION_ID, FeatureDrawMode, FeatureDrawOptions } from '@oida/core';

import { MapInteractionType } from './map-interaction';
import { enumFromType } from '../mst/enum-from-type';

export const FeatureDrawInteraction = MapInteractionType.addModel(types.model(
    FEATURE_DRAW_INTERACTION_ID,
    {
        drawMode: types.optional(enumFromType<FeatureDrawMode>(FeatureDrawMode), FeatureDrawMode.Off)
    }
).volatile((self) => ({
    drawOptions: {}
})).actions((self) => {
    return {
        setDrawMode: (mode: FeatureDrawMode, options: FeatureDrawOptions) => {
            self.drawMode = mode;
            self.drawOptions = options;
        }
    };
}));

export type IFeatureDrawInteraction = Instance<typeof FeatureDrawInteraction>;
