import { autorun } from 'mobx';

import { StackVolumeView } from '@oida/core';

import { StackVolumeViewMode } from '../../../models/map/layers/volume-layer';

import { VolumeViewModeController } from './volume-view-mode-controller';

export class VolumeStackViewController extends VolumeViewModeController<StackVolumeView, StackVolumeViewMode> {

    constructor(config) {
        super(config);
    }

    bindToViewModeState_() {
        super.bindToViewModeState_();

        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.viewModeImplementation_.setNumSlices(this.viewModeState_.numSlices);
        }));
    }

    unbindFromViewModeState_() {
        super.unbindFromViewModeState_();
    }

}
