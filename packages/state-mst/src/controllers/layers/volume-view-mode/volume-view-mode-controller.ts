import { autorun } from 'mobx';

import { SubscriptionTracker, IVolumeViewMode } from '@oida/core';

import { IVolumeViewMode as VolumeViewModeState } from '../../../types/layers/volume-layer';

export abstract class VolumeViewModeController
<T extends IVolumeViewMode = IVolumeViewMode, S extends VolumeViewModeState = VolumeViewModeState> {

    protected viewModeState_: S;
    protected viewModeImplementation_: T;
    protected subscriptionTracker_: SubscriptionTracker = new SubscriptionTracker();

    constructor(config) {
        this.viewModeState_ = config.viewModeState;
        this.viewModeImplementation_ = config.viewModeImplementation;

        this.bindToViewModeState_();
    }

    destroy() {
        this.unbindFromViewModeState_();
        this.viewModeImplementation_.destroy();
    }

    protected bindToViewModeState_() {
    }

    protected unbindFromViewModeState_() {
        this.subscriptionTracker_.unsubscribe();
    }

}
