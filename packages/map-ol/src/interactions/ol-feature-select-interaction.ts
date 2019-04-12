import {
    IFeatureSelectInteractionProps,
    FEATURE_SELECT_INTERACTION_ID,
    IFeatureSelectInteractionImplementation,
    SelectionMode
} from '@oida/core';

import { OLSelectInteraction } from '../utils/ol-select-interaction';
import { click, platformModifierKeyOnly, shiftKeyOnly } from 'ol/events/condition';

import { olInteractionsFactory } from './ol-interactions-factory';
import { OLMapRenderer } from '../map/ol-map-renderer';


export class OLFeatureSelectInteraction  implements IFeatureSelectInteractionImplementation  {

    private viewer_;
    private olInteraction_;
    private multiple_: boolean;

    constructor(config: IFeatureSelectInteractionProps<OLMapRenderer>) {
        this.multiple_ = false;
        this.viewer_ = config.mapRenderer.getViewer();
        this.initInteraction_(config.onFeatureSelect);
    }

    setActive(active) {
        if (active) {
            this.viewer_.addInteraction(this.olInteraction_);
        } else {
            this.viewer_.removeInteraction(this.olInteraction_);
        }
    }

    setMultiple(multiple) {
        this.multiple_ = multiple;
    }

    destroy() {
        this.viewer_.removeInteraction(this.olInteraction_);
        delete this.olInteraction_;
    }

    initInteraction_(onFeatureSelect) {
        this.olInteraction_ = new OLSelectInteraction({
            condition: click,
            hitTolerance: 5
        });

        this.olInteraction_.on('select', (evt) => {
            let feature = evt.selected;

            let selectionMode = SelectionMode.Replace;
            if (this.multiple_) {
                if (platformModifierKeyOnly(evt.mapBrowserEvent)) {
                    selectionMode = SelectionMode.Toggle;
                } else if (shiftKeyOnly(evt.mapBrowserEvent)) {
                    selectionMode = SelectionMode.Add;
                }
            }

            onFeatureSelect(feature ? feature.getId() : null, selectionMode);
        });
    }
}

olInteractionsFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new OLFeatureSelectInteraction(config);
});
