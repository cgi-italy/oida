import { observable, makeObservable, action } from 'mobx';

import { FEATURE_DRAW_INTERACTION_ID, FeatureDrawMode, FeatureDrawOptions } from '@oida/core';

import { MapInteraction, MapInteractionProps } from './map-interaction';


export type FeatureDrawInteractionProps = {
} & Omit<MapInteractionProps, 'interactionType'>;

export class FeatureDrawInteraction extends MapInteraction {

    @observable.ref drawMode: FeatureDrawMode;
    drawOptions: FeatureDrawOptions;

    constructor(props: FeatureDrawInteractionProps) {
        super({
            ...props,
            interactionType: FEATURE_DRAW_INTERACTION_ID
        });

        this.drawMode = FeatureDrawMode.Off;
        this.drawOptions = {};

        makeObservable(this);
    }

    @action
    setDrawMode(drawMode: FeatureDrawMode, options: FeatureDrawOptions) {
        this.drawOptions = options;
        this.drawMode = drawMode;
    }

}

MapInteraction.register(FEATURE_DRAW_INTERACTION_ID, FeatureDrawInteraction);
