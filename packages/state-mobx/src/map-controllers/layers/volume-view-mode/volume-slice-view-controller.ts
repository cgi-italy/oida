import { autorun } from 'mobx';

import { SliceVolumeView } from '@oida/core';

import { SliceVolumeViewMode } from '../../../models/map/layers/volume-layer';

import { VolumeViewModeController } from './volume-view-mode-controller';

export class VolumeSliceViewController extends VolumeViewModeController<SliceVolumeView, SliceVolumeViewMode> {

    constructor(config) {
        super(config);
    }

    bindToViewModeState_() {
        super.bindToViewModeState_();

        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.viewModeImplementation_.setXSlice(this.viewModeState_.xSlice);
        }));

        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.viewModeImplementation_.setYSlice(this.viewModeState_.ySlice);
        }));

        this.subscriptionTracker_.addSubscription(autorun(() => {
            this.viewModeImplementation_.setZSlice(this.viewModeState_.zSlice);
        }));
    }

    unbindFromViewModeState_() {
        super.unbindFromViewModeState_();
    }

}
