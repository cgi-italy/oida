import { observable, makeObservable, action } from 'mobx';

import { LAYER_SWIPE_INTERACTION_ID } from '@oidajs/core';

import { MapInteraction, MapInteractionProps } from './map-interaction';
import { MapLayer } from '../layers';

export type LayerSwipeInteractionProps = {
    swipePosition?: number;
} & Omit<MapInteractionProps, 'interactionType'>;

export class LayerSwipeInteraction extends MapInteraction {
    @observable.ref targetLayer: MapLayer | undefined;
    @observable swipePosition: number;
    constructor(props?: LayerSwipeInteractionProps) {
        super({
            ...props,
            interactionType: LAYER_SWIPE_INTERACTION_ID
        });

        this.targetLayer = undefined;
        this.swipePosition = typeof props?.swipePosition === 'number' ? props?.swipePosition : 0.5;

        makeObservable(this);
    }

    @action
    setTargetLayer(targetLayer: MapLayer | undefined) {
        this.targetLayer = targetLayer;
    }

    @action
    setSwipePosition(swipePosition: number) {
        if (swipePosition < 0) {
            swipePosition = 0;
        }
        if (swipePosition > 1) {
            swipePosition = 1;
        }
        this.swipePosition = swipePosition;
    }
}

MapInteraction.register(LAYER_SWIPE_INTERACTION_ID, LayerSwipeInteraction);
