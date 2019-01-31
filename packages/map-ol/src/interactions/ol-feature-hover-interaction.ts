import { IFeatureHoverInteractionProps, FEATURE_HOVER_INTERACTION_ID, IFeatureHoverInteractionImplementation } from '@oida/core';

import { OLSelectInteraction } from '../utils/ol-select-interaction';

import { pointerMove } from 'ol/events/condition';

import { olInteractionsFactory } from './ol-interactions-factory';
import { OLMapRenderer } from '../map/ol-map-renderer';


export class OLFeatureHoverInteraction  implements IFeatureHoverInteractionImplementation  {

    private viewer_;
    private olInteraction_;

    constructor(config: IFeatureHoverInteractionProps<OLMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.initInteraction_(config.onFeatureHover);
    }

    setActive(active) {
        if (active) {
            this.viewer_.addInteraction(this.olInteraction_);
        } else {
            this.viewer_.removeInteraction(this.olInteraction_);
        }
    }

    destroy() {
        this.viewer_.removeInteraction(this.olInteraction_);
        delete this.olInteraction_;
    }

    initInteraction_(onFeatureHover) {
        this.olInteraction_ = new OLSelectInteraction({
            condition: pointerMove,
            hitTolerance: 5
        });

        this.olInteraction_.on('select', (evt) => {
            let feature = evt.selected;
            if (feature) {
                this.viewer_.getViewport().style.cursor = 'pointer';
                onFeatureHover(feature.getId());
            } else {
                this.viewer_.getViewport().style.cursor = '';
                onFeatureHover(null);
            }
            onFeatureHover(feature ? feature.getId() : null);
        });
    }
}

olInteractionsFactory.register(FEATURE_HOVER_INTERACTION_ID, (config) => {
    return new OLFeatureHoverInteraction(config);
});
