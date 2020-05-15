import { types, Instance } from 'mobx-state-tree';

import { FEATURE_DRAW_INTERACTION_ID, FeatureDrawMode, FeatureDrawOptions } from '@oida/core';

import { MapInteraction } from './map-interaction';
import { enumFromType } from '../mst/enum-from-type';

const FeatureDrawInteractionDecl = MapInteraction.addModel(types.model(
    FEATURE_DRAW_INTERACTION_ID,
    {
        drawMode: types.optional(enumFromType<FeatureDrawMode>(FeatureDrawMode), FeatureDrawMode.Off)
    }
).volatile((self) => ({
    drawOptions: {} as FeatureDrawOptions
})).actions((self) => {
    return {
        setDrawMode: (mode: FeatureDrawMode, options: FeatureDrawOptions) => {
            self.drawMode = mode;
            self.drawOptions = options;
        }
    };
}));

type FeatureDrawInteractionType = typeof FeatureDrawInteractionDecl;
export interface FeatureDrawInteractionInterface extends FeatureDrawInteractionType {}
export const FeatureDrawInteraction: FeatureDrawInteractionInterface = FeatureDrawInteractionDecl;
export interface IFeatureDrawInteraction extends Instance<FeatureDrawInteractionInterface> {}

