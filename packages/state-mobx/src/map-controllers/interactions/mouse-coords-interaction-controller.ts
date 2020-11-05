import { MapInteractionController } from './map-interaction-controller';

import { IMapInteractionImplementation, MOUSE_COORDS_INTERACTION_ID } from '@oida/core';

import { interactionControllersFactory } from './interaction-controllers-factory';

import { MouseCoordsInteraction } from '../../models/map/interactions/mouse-coords-interaction';

export class MouseCoordsInteractionController extends MapInteractionController<IMapInteractionImplementation, MouseCoordsInteraction> {

    constructor(config)  {
        super(config);
    }

    protected getImplementationProps_() {
        return {
            ...super.getImplementationProps_(),
            onMouseCoords: (mouseCoords) => {
                this.interaction_.setMouseCoords(mouseCoords);
            }
        };
    }
}

interactionControllersFactory.register(MOUSE_COORDS_INTERACTION_ID, (config) => {
    return new MouseCoordsInteractionController(config);
});
