import { transform } from 'ol/proj';
import Map from 'ol/Map';
import { click, platformModifierKeyOnly, shiftKeyOnly } from 'ol/events/condition';

import {
    IFeatureSelectInteractionProps,
    FEATURE_SELECT_INTERACTION_ID,
    IFeatureSelectInteractionImplementation,
    SelectionMode,
    FeatureSelectCallback
} from '@oidajs/core';

import { OLSelectInteraction, OLSelectEvent } from '../utils/ol-select-interaction';
import { OLMapRenderer } from '../map/ol-map-renderer';
import { OLFeatureLayer } from '../layers/ol-feature-layer';
import { OLMapLayer } from '../layers/ol-map-layer';
import { getFeaturesData } from '../utils';
import { olInteractionsFactory } from './ol-interactions-factory';

export class OLFeatureSelectInteraction implements IFeatureSelectInteractionImplementation {
    private viewer_: Map;
    private olInteraction_!: OLSelectInteraction;
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
        this.olInteraction_.dispose();
    }

    protected initInteraction_(onFeatureSelect: FeatureSelectCallback) {
        this.olInteraction_ = new OLSelectInteraction({
            condition: click,
            hitTolerance: 5,
            drillPick: true
        });

        let lastSelectedFeatureIdx = -1;

        //@ts-ignore
        this.olInteraction_.on('select', (evt: OLSelectEvent) => {
            const features = evt.selected;

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
                    const selected = features[lastSelectedFeatureIdx];
                    const selectedFeatures = getFeaturesData(selected);
                    if (selectedFeatures.length) {
                        selectedFeatures.forEach((feature) => {
                            onFeatureSelect({
                                feature: feature,
                                mode: selectionMode
                            });
                            // add all remaining features to the selection (cluster selection)
                            selectionMode = SelectionMode.Add;
                        });

                        const layer: OLMapLayer | undefined = selected.get(OLFeatureLayer.FEATURE_LAYER_KEY);
                        if (layer && layer.shouldReceiveFeatureSelectEvents()) {
                            let coordinate = evt.mapBrowserEvent.coordinate;
                            const proj = this.viewer_.getView().getProjection();
                            if (proj.getCode() !== 'EPSG:4326') {
                                coordinate = transform(coordinate, proj, 'EPSG:4326');
                            }
                            layer.onFeatureSelect(coordinate, selectedFeatures[0]);
                        }
                    } else {
                        onFeatureSelect({
                            feature: undefined,
                            mode: selectionMode
                        });
                    }
                } else {
                    lastSelectedFeatureIdx = -1;
                    features.forEach((selected) => {
                        const selectedFeatures = getFeaturesData(selected);
                        if (selectedFeatures.length) {
                            selectedFeatures.forEach((feature) => {
                                onFeatureSelect({
                                    feature: feature,
                                    mode: selectionMode
                                });
                            });
                        }
                    });
                }
            } else {
                lastSelectedFeatureIdx = -1;
                onFeatureSelect({
                    feature: undefined,
                    mode: selectionMode
                });
            }
        });
    }
}

olInteractionsFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new OLFeatureSelectInteraction(config);
});
