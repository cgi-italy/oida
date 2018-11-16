import { MapInteractionController } from './map-interaction-controller';

import { IMapInteractionImplementation, MOUSE_COORDS_INTERACTION_ID } from '@cgi-eo/map-core';

import { interactionControllersFactory } from './interaction-controllers-factory';

import { IMouseCoordsInteraction } from '../../types/interactions/mouse-coord-interaction';

export class MouseCoordsInteractionController extends MapInteractionController<IMapInteractionImplementation, IMouseCoordsInteraction> {

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
