
import { autorun } from 'mobx';
import { SubscriptionTracker, IMapInteractionImplementation, IMapRenderer } from '@oida/core';

import { IMapInteraction } from '../../types/interactions/map-interaction';

export class MapInteractionController<
    T extends IMapInteractionImplementation = IMapInteractionImplementation,
    I extends IMapInteraction = IMapInteraction
> {
    protected interaction_: I;
    protected interactionImpl_: T;
    protected subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();

    constructor(config) {
        this.interaction_ = config.interaction;
        this.interactionImpl_ = null;
    }

    setMapRenderer(mapRenderer: IMapRenderer) {
        this.destroy();
        if (mapRenderer) {
            this.interactionImpl_ = this.createInteractionImpl_(mapRenderer);
            if (this.interactionImpl_) {
                this.bindToInteractionState_();
            }
        }
    }

    destroy() {
        if (this.interactionImpl_) {
            this.interactionImpl_.destroy();
            this.unbindFromInteractionState_();
            this.interactionImpl_ = null;
        }
    }

    protected bindToInteractionState_() {
        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.interactionImpl_.setActive(this.interaction_.active);
        }));
    }

    protected unbindFromInteractionState_() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected createInteractionImpl_(mapRenderer: IMapRenderer) {
        return <T>mapRenderer.getInteractionsFactory().create(this.interaction_.mapInteractionType, {
            ...this.getImplementationProps_(),
            mapRenderer: mapRenderer
        });
    }

    protected getImplementationProps_() {
        return {
            active: this.interaction_.active
        };
    }

}
