import { SubscriptionTracker, IMapRenderer } from '@oida/core';

import { Collection } from '../../types/core/collection';
import { MapInteraction, IMapInteraction } from '../../types/interactions/map-interaction';
import { MapInteractionController } from './map-interaction-controller';
import { interactionControllersFactory } from './interaction-controllers-factory';

//only for typings
const CollectionInstance = Collection(MapInteraction).create({});

export class InteractionListController {

    private interactions_: typeof CollectionInstance;
    private mapRenderer_: IMapRenderer;
    private interactionControllers_: {
        [x: string]: MapInteractionController
    };
    private subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();

    constructor(config) {
        this.interactions_ = config.interactions;
        this.mapRenderer_ = null;

        this.interactionControllers_ = {};

        this.bindToInteractionsState_();
    }

    setMapRenderer(renderer: IMapRenderer) {
        this.mapRenderer_ = renderer;
        for (let id in this.interactionControllers_) {
            this.interactionControllers_[id].setMapRenderer(renderer);
        }
    }

    destroy() {
        for (let id in this.interactionControllers_) {
            this.destroyInteractionController_(id);
        }
        this.subscriptionTracker_.unsubscribe();
    }

    private createInteractionController_(interaction: IMapInteraction) {
        let interactionController = interactionControllersFactory.create(interaction.mapInteractionType, {
            interaction
        });

        if (interactionController) {
            this.interactionControllers_[interaction.id] = interactionController;
            interactionController.setMapRenderer(this.mapRenderer_);
        }
    }

    private destroyInteractionController_(id) {
        let interactionController = this.interactionControllers_[id];
        if (interactionController) {
            interactionController.destroy();
        }
        delete this.interactionControllers_[id];
    }

    private bindToInteractionsState_() {

        this.subscriptionTracker_.addSubscription(this.interactions_.items.observe((change) => {
            if (change.type === 'splice') {
                change.removed.forEach((interaction: any) => {
                    this.destroyInteractionController_(interaction.snapshot.id);
                });

                change.added.forEach((interaction: any) => {
                    this.createInteractionController_(interaction.value);
                });

            }
        }));

        this.interactions_.items.forEach((interaction) => {
            this.createInteractionController_(interaction);
        });
    }

}

