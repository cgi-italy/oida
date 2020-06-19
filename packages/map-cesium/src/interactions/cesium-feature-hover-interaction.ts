import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import KeyboardEventModifier from 'cesium/Source/Core/KeyboardEventModifier';

import { IFeatureHoverInteractionImplementation, IFeatureHoverInteractionProps, FEATURE_HOVER_INTERACTION_ID } from '@oida/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import {
    getPickedFeatureEntity, getPickedLayer,
    isFeaturePickable, setNonPickableFeaturesVisibility
} from '../layers/cesium-feature-layer';

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
            let pickedObjects = this.viewer_.scene.drillPick(movement.endPosition);
            const pickInfo = pickedObjects.find(pickInfo => isFeaturePickable(pickInfo));

            if (pickInfo) {
                this.viewer_.container .style.cursor = 'pointer';
                let entityId = getPickedFeatureEntity(pickInfo);
                if (entityId !== hoveredFeature) {
                    onFeatureHover(entityId);
                    hoveredFeature = entityId;
                }
                let layer = getPickedLayer(pickInfo);
                if (layer && layer.onLayerHover) {
                    setNonPickableFeaturesVisibility(pickedObjects, false);
                    //layer.updateDataSource_();
                    this.viewer_.scene.render();
                    let coordinate = this.viewer_.scene.pickPosition(movement.endPosition);
                    setNonPickableFeaturesVisibility(pickedObjects, true);
                    layer.onLayerHover(coordinate, entityId, pickInfo);
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
