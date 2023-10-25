import { autorun } from 'mobx';
import { SubscriptionTracker, IMapInteractionImplementation, IMapRenderer } from '@oidajs/core';

import { MapInteraction } from '../../models/map/interactions/map-interaction';

export class MapInteractionController<
    T extends IMapInteractionImplementation = IMapInteractionImplementation,
    I extends MapInteraction = MapInteraction
> {
    protected interaction_: I;
    protected interactionImpl_: T | undefined;
    protected subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();

    constructor(config) {
        this.interaction_ = config.interaction;
    }

    setMapRenderer(mapRenderer: IMapRenderer | undefined) {
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
            delete this.interactionImpl_;
        }
    }

    protected bindToInteractionState_() {
        this.interaction_.setImplementation(this.interactionImpl_);
        this.subscriptionTracker_.addSubscription(
            autorun(() => {
                this.interactionImpl_!.setActive(this.interaction_.active.value);
            })
        );
    }

    protected unbindFromInteractionState_() {
        this.interaction_.setImplementation(undefined);
        this.subscriptionTracker_.unsubscribe();
    }

    protected createInteractionImpl_(mapRenderer: IMapRenderer) {
        return <T>mapRenderer.getInteractionsFactory().create(this.interaction_.interactionType, {
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
