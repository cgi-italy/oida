import { useObserver } from 'mobx-react';


import { MOUSE_COORDS_INTERACTION_ID } from '@oida/core';
import { MouseCoordsInteraction, IMouseCoordsInteraction } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';


export type MouseCoordsProps = {
    mouseCoordsInteraction: IMouseCoordsInteraction
};

export const useMouseCoords = ({mouseCoordsInteraction}: MouseCoordsProps) => {
    return useObserver(() => ({
        coords: mouseCoordsInteraction.mouseCoords
    }));
};

export const useMapMouseCoordsFromModule = (mapModule?) => {
    let moduleState = useMapModuleState(mapModule);

    let mouseCoordsInteraction = moduleState.map.interactions.items.find((interaction) => {
        return interaction.mapInteractionType === MOUSE_COORDS_INTERACTION_ID;
    }) as IMouseCoordsInteraction;

    if (!mouseCoordsInteraction) {
        mouseCoordsInteraction = MouseCoordsInteraction.create({
            id: MOUSE_COORDS_INTERACTION_ID
        });
        moduleState.map.interactions.add(mouseCoordsInteraction);
    }

    return useMouseCoords({
        mouseCoordsInteraction
    });
};

