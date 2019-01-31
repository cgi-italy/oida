import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';


import { IFeatureHoverInteractionImplementation, IFeatureHoverInteractionProps, FEATURE_HOVER_INTERACTION_ID } from '@oida/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';

export class CesiumFeatureHoverInteraction implements IFeatureHoverInteractionImplementation {

    private viewer_;
    private handler_;
    private onFeatureHover_;

    constructor(props: IFeatureHoverInteractionProps<CesiumMapRenderer>) {
        this.viewer_ = props.mapRenderer.getViewer();

        this.onFeatureHover_ = props.onFeatureHover;
    }

    setActive(active) {
        if (active) {
            this.bindMove_(this.onFeatureHover_);
        } else {
            if (this.handler_) {
                this.handler_.destroy();
                delete this.handler_;
            }
        }
    }

    destroy() {
        this.setActive(false);
    }

    bindMove_(onFeatureHover) {

        let hoveredFeature = null;

        this.handler_ = new ScreenSpaceEventHandler(this.viewer_.scene.canvas);

        this.handler_.setInputAction((movement) => {
            let feature = this.viewer_.scene.pick(movement.endPosition);
            if (feature) {
                if (feature.primitive !== hoveredFeature) {
                    onFeatureHover(feature.id);
                    hoveredFeature = feature.primitive;
                }
            } else {
                if (hoveredFeature) {
                    onFeatureHover(null);
                    hoveredFeature = null;
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }


}

cesiumInteractionsFactory.register(FEATURE_HOVER_INTERACTION_ID, (config) => {
    return new CesiumFeatureHoverInteraction(config);
});
