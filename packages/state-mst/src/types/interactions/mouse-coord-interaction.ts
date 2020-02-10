import { types, Instance } from 'mobx-state-tree';

import { MapInteraction } from './map-interaction';

import { MOUSE_COORDS_INTERACTION_ID } from '@oida/core';

const MouseCoordsInteractionDecl = MapInteraction.addModel(types.model(
    MOUSE_COORDS_INTERACTION_ID,
    {
        mouseCoords: types.maybe(types.frozen()),
    }
).actions((self) => {
    return {
        setMouseCoords: (coords) => {
            self.mouseCoords = coords;
        }
    };
}));


type MouseCoordsInteractionType = typeof MouseCoordsInteractionDecl;
export interface MouseCoordsInteractionInterface extends MouseCoordsInteractionType {}
export const MouseCoordsInteraction: MouseCoordsInteractionInterface = MouseCoordsInteractionDecl;
export interface IMouseCoordsInteraction extends Instance<MouseCoordsInteractionInterface> {}

