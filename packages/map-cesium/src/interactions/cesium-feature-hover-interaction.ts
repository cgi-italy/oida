import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import KeyboardEventModifier from 'cesium/Source/Core/KeyboardEventModifier';

import { IFeatureHoverInteractionImplementation, IFeatureHoverInteractionProps, FEATURE_HOVER_INTERACTION_ID } from '@oida/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import { getPickedFeatureEntity } from '../layers';

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

        let onMouseMove = (movement) => {
            let pickInfo = this.viewer_.scene.pick(movement.endPosition);
            if (pickInfo) {
                this.viewer_.container .style.cursor = 'pointer';
                let entityId = getPickedFeatureEntity(pickInfo);
                if (entityId !== hoveredFeature) {
                    onFeatureHover(entityId);
                    hoveredFeature = entityId;
                }
            } else {
                this.viewer_.container .style.cursor = '';
                if (hoveredFeature) {
                    onFeatureHover(null);
                    hoveredFeature = null;
                }
            }
        };

        this.handler_.setInputAction(onMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
        this.handler_.setInputAction(onMouseMove, ScreenSpaceEventType.MOUSE_MOVE, KeyboardEventModifier.SHIFT);
        this.handler_.setInputAction(onMouseMove, ScreenSpaceEventType.MOUSE_MOVE, KeyboardEventModifier.CTRL);
    }


}

cesiumInteractionsFactory.register(FEATURE_HOVER_INTERACTION_ID, (config) => {
    return new CesiumFeatureHoverInteraction(config);
});
