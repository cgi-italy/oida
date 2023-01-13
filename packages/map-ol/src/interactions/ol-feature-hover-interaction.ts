import { transform } from 'ol/proj';
import { pointerMove } from 'ol/events/condition';
import Map from 'ol/Map';

import {
    IFeatureHoverInteractionProps,
    FEATURE_HOVER_INTERACTION_ID,
    IFeatureHoverInteractionImplementation,
    IFeature
} from '@oidajs/core';

import { OLSelectEvent, OLSelectInteraction } from '../utils/ol-select-interaction';
import { OLMapRenderer } from '../map/ol-map-renderer';
import { OLMapLayer } from '../layers/ol-map-layer';
import { OLFeatureLayer } from '../layers/ol-feature-layer';
import { olInteractionsFactory } from './ol-interactions-factory';

export class OLFeatureHoverInteraction implements IFeatureHoverInteractionImplementation {
    private viewer_: Map;
    private olInteraction_!: OLSelectInteraction;

    constructor(config: IFeatureHoverInteractionProps<OLMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.initInteraction_(config.onFeatureHover);
    }

    setActive(active) {
        if (active) {
            this.viewer_.addInteraction(this.olInteraction_);
        } else {
            this.viewer_.removeInteraction(this.olInteraction_);
            this.viewer_.getViewport().style.cursor = '';
        }
    }

    destroy() {
        this.viewer_.removeInteraction(this.olInteraction_);
        this.olInteraction_.dispose();
    }

    protected initInteraction_(onFeatureHover: (hovered: IFeature<any> | undefined) => void) {
        this.olInteraction_ = new OLSelectInteraction({
            condition: pointerMove,
            hitTolerance: 5
        });

        //@ts-ignore
        this.olInteraction_.on('select', (evt: OLSelectEvent) => {
            const selected = evt.selected[0];
            if (selected) {
                const featureId = selected.getId();
                const featureData = selected.get(OLFeatureLayer.FEATURE_DATA_KEY);
                if (typeof featureId === 'string' && featureData) {
                    const feature: IFeature = {
                        id: featureId,
                        data: featureData
                    };
                    this.viewer_.getViewport().style.cursor = 'pointer';
                    onFeatureHover(feature);
                    const layer: OLMapLayer | undefined = selected.get(OLFeatureLayer.FEATURE_LAYER_KEY);
                    if (layer && layer.shouldReceiveFeatureHoverEvents()) {
                        let coordinate = evt.mapBrowserEvent.coordinate;
                        const proj = this.viewer_.getView().getProjection();
                        if (proj.getCode() !== 'EPSG:4326') {
                            coordinate = transform(coordinate, proj, 'EPSG:4326');
                        }
                        layer.onFeatureHover(coordinate, feature);
                    }
                } else {
                    this.viewer_.getViewport().style.cursor = '';
                    onFeatureHover(undefined);
                }
            } else {
                this.viewer_.getViewport().style.cursor = '';
                onFeatureHover(undefined);
            }
        });
    }
}

olInteractionsFactory.register(FEATURE_HOVER_INTERACTION_ID, (config) => {
    return new OLFeatureHoverInteraction(config);
});
