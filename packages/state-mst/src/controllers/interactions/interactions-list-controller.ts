import { SubscriptionTracker, IMapRenderer } from '@oida/core';

import { Collection } from '../../types/core/collection';
import { MapInteractionType, IMapInteraction } from '../../types/interactions/map-interaction';
import { MapInteractionController } from './map-interaction-controller';
import { interactionControllersFactory } from './interaction-controllers-factory';

import { ArrayTracker } from '../../utils/array-tracker';

//only for typings
const CollectionInstance = Collection(MapInteractionType).create({});

export class InteractionListController {

    private interactions_: typeof CollectionInstance;
    private mapRenderer_: IMapRenderer;

    private interactionsTracker_: ArrayTracker<MapInteractionController>;

    constructor(config) {
        this.interactions_ = config.interactions;
        this.mapRenderer_ = null;

        this.interactionsTracker_ = new ArrayTracker({
            items: this.interactions_.items,
            onItemAdd: this.createInteractionController_.bind(this),
            onItemRemove: this.destroyInteractionController_.bind(this)
        });
    }

    setMapRenderer(renderer: IMapRenderer) {
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

    private destroyInteractionController_(controller: MapInteractionController) {
        if (controller) {
            controller.destroy();
        }
    }

}

