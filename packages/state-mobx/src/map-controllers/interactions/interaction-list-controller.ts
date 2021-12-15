import { IMapRenderer } from '@oidajs/core';

import { MapInteractionController } from './map-interaction-controller';
import { interactionControllersFactory } from './interaction-controllers-factory';

import { ArrayTracker } from '../../utils/array-tracker';
import { IObservableArray } from 'mobx';
import { MapInteraction } from '../../models/map/interactions';

export type InteractionListControllerProps = {
    interactions: IObservableArray<MapInteraction>
};

export class InteractionListController {

    private interactions_: IObservableArray<MapInteraction>;
    private mapRenderer_: IMapRenderer | undefined;

    private interactionsTracker_: ArrayTracker<MapInteraction, MapInteractionController | undefined>;

    constructor(props: InteractionListControllerProps) {
        this.interactions_ = props.interactions;

        this.interactionsTracker_ = new ArrayTracker({
            items: this.interactions_,
            onItemAdd: this.createInteractionController_.bind(this),
            onItemRemove: this.destroyInteractionController_.bind(this)
        });
    }

    setMapRenderer(renderer: IMapRenderer | undefined) {
        this.mapRenderer_ = renderer;
        this.interactionsTracker_.forEachItem((controller) => {
            if (controller) {
                controller.setMapRenderer(renderer);
            }
        });
    }

    destroy() {
        this.interactionsTracker_.destroy();
    }

    private createInteractionController_(interaction: MapInteraction) {
        let interactionController = interactionControllersFactory.create(interaction.interactionType, {
            interaction
        });

        if (interactionController) {
            interactionController.setMapRenderer(this.mapRenderer_);
        }

        return interactionController;
    }

    private destroyInteractionController_(controller: MapInteractionController | undefined) {
        if (controller) {
            controller.destroy();
        }
    }

}

