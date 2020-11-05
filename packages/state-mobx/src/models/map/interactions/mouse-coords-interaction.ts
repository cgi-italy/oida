import { observable, makeObservable, action } from 'mobx';

import { MOUSE_COORDS_INTERACTION_ID } from '@oida/core';

import { MapInteraction, MapInteractionProps } from './map-interaction';

export type MouseCoords = {
    lat: number,
    lon: number
};

export type MouseCoordsInteractionProps = {
} & Omit<MapInteractionProps, 'interactionType'>;

export class MouseCoordsInteraction extends MapInteraction {
    @observable.ref mouseCoords: MouseCoords | undefined;
    constructor(props?: MouseCoordsInteractionProps) {
        super({
            ...props,
            interactionType: MOUSE_COORDS_INTERACTION_ID
        });

        this.mouseCoords = undefined;

        makeObservable(this);
    }

    @action
    setMouseCoords(mouseCoords: MouseCoords | undefined) {
        this.mouseCoords = mouseCoords;
    }
}

MapInteraction.register(MOUSE_COORDS_INTERACTION_ID, MouseCoordsInteraction);
