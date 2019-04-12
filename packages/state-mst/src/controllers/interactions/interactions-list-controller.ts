import { SubscriptionTracker, IMapRenderer } from '@oida/core';

import { Collection } from '../../types/core/collection';
import { MapInteraction, IMapInteraction } from '../../types/interactions/map-interaction';
import { MapInteractionController } from './map-interaction-controller';
import { interactionControllersFactory } from './interaction-controllers-factory';

import { ArrayTracker } from '../../utils/array-tracker';

//only for typings
const CollectionInstance = Collection(MapInteraction.Type).create({items: []});

export class InteractionListController {

    private interactions_: typeof CollectionInstance;
    private mapRenderer_: IMapRenderer | undefined;

    private interactionsTracker_: ArrayTracker<MapInteractionController | undefined, typeof MapInteraction.Type>;

    constructor(config) {
        this.interactions_ = config.interactions;

        this.interactionsTracker_ = new ArrayTracker({
            items: this.interactions_.items,
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

    private createInteractionController_(interaction: IMapInteraction) {
        let interactionController = interactionControllersFactory.create(interaction.mapInteractionType, {
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

