import { types, Instance } from 'mobx-state-tree';

import { MapInteraction } from './map-interaction';

import { MOUSE_COORDS_INTERACTION_ID } from '@oida/core';

export const MouseCoordsInteraction = MapInteraction.addModel(types.model(
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

export type IMouseCoordsInteraction = Instance<typeof MouseCoordsInteraction>;
