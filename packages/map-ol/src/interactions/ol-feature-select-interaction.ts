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
import { OLFeatureLayer } from '../layers/ol-feature-layer';


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
            hitTolerance: 5,
            drillPick: true
        });

        let lastSelectedFeatureIdx = -1;

        this.olInteraction_.on('select', (evt) => {
            let features = evt.selected;

            let selectionMode = SelectionMode.Replace;
            if (this.multiple_) {
                if (platformModifierKeyOnly(evt.mapBrowserEvent)) {
                    selectionMode = SelectionMode.Toggle;
                } else if (shiftKeyOnly(evt.mapBrowserEvent)) {
                    selectionMode = SelectionMode.Add;
                }
            }
            if (features.length) {
                if (selectionMode === SelectionMode.Replace) {
                    // implement cycle picking: when clicking multiple times on the same point the selection
                    // will cycle through the features under the cursor
                    lastSelectedFeatureIdx = (lastSelectedFeatureIdx + 1) % features.length;
                    const feature = features[lastSelectedFeatureIdx];
                    onFeatureSelect({
                        featureId: feature.getId(),
                        data: feature.get(OLFeatureLayer.FEATURE_DATA_KEY),
                        mode: selectionMode
                    });
                } else {
                    lastSelectedFeatureIdx = -1;
                    features.forEach((feature) => {
                        onFeatureSelect({
                            featureId: feature.getId(),
                            data: feature.get(OLFeatureLayer.FEATURE_DATA_KEY),
                            mode: selectionMode
                        });
                    });
                }
            } else {
                lastSelectedFeatureIdx = -1;
                onFeatureSelect({
                    featureId: undefined,
                    mode: selectionMode
                });
            }
        });
    }
}

olInteractionsFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new OLFeatureSelectInteraction(config);
});
