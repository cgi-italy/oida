import { transform } from 'ol/proj';
import Map from 'ol/Map';

import {
    IFeatureSelectInteractionProps,
    FEATURE_SELECT_INTERACTION_ID,
    IFeatureSelectInteractionImplementation,
    SelectionMode,
    IFeature,
    FeatureSelectCallback
} from '@oidajs/core';

import { OLSelectInteraction, OLSelectEvent } from '../utils/ol-select-interaction';
import { click, platformModifierKeyOnly, shiftKeyOnly } from 'ol/events/condition';

import { olInteractionsFactory } from './ol-interactions-factory';
import { OLMapRenderer } from '../map/ol-map-renderer';
import { OLFeatureLayer } from '../layers/ol-feature-layer';
import { OLMapLayer } from '../layers/ol-map-layer';
import { FeatureLike } from 'ol/Feature';

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
                    const feature = this.getFeatureForSelection_(selected);
                    if (feature) {
                        onFeatureSelect({
                            feature: feature,
                            mode: selectionMode
                        });

                        const layer: OLMapLayer | undefined = selected.get(OLFeatureLayer.FEATURE_LAYER_KEY);
                        if (layer && layer.shouldReceiveFeatureSelectEvents()) {
                            let coordinate = evt.mapBrowserEvent.coordinate;
                            const proj = this.viewer_.getView().getProjection();
                            if (proj.getCode() !== 'EPSG:4326') {
                                coordinate = transform(coordinate, proj, 'EPSG:4326');
                            }
                            layer.onFeatureSelect(coordinate, feature);
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
                        const feature = this.getFeatureForSelection_(selected);
                        if (feature) {
                            onFeatureSelect({
                                feature: feature,
                                mode: selectionMode
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

    protected getFeatureForSelection_(selection: FeatureLike): IFeature | undefined {
        const featureId = selection.getId();
        const featureData = selection.get(OLFeatureLayer.FEATURE_DATA_KEY);
        if (typeof featureId === 'string' && featureData) {
            return {
                id: featureId,
                data: featureData
            };
        } else {
            return undefined;
        }
    }
}

olInteractionsFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new OLFeatureSelectInteraction(config);
});
