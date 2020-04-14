import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import KeyboardEventModifier from 'cesium/Source/Core/KeyboardEventModifier';

import {
    IFeatureSelectInteractionImplementation,
    IFeatureSelectInteractionProps,
    FEATURE_SELECT_INTERACTION_ID,
    SelectionMode
} from '@oida/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import { getPickedFeatureEntity, getPickedLayer } from '../layers';

export class CesiumFeatureSelectInteraction implements IFeatureSelectInteractionImplementation {

    private viewer_;
    private handler_;
    private onFeatureSelect_;
    private multiple_: boolean;

    constructor(props: IFeatureSelectInteractionProps<CesiumMapRenderer>) {
        this.viewer_ = props.mapRenderer.getViewer();
        this.onFeatureSelect_ = props.onFeatureSelect;
        this.multiple_ = false;
    }

    setActive(active) {
        if (active) {
            this.bindClick_();
        } else {
            if (this.handler_) {
                this.handler_.destroy();
                delete this.handler_;
            }
        }
    }

    setMultiple(multiple) {
        this.multiple_ = multiple;
        if (this.handler_) {
            this.bindClick_();
        }
    }

    destroy() {
        this.setActive(false);
    }

    bindClick_() {

        if (this.handler_) {
            this.handler_.destroy();
        }

        this.handler_ = new ScreenSpaceEventHandler(this.viewer_.scene.canvas);

        this.handler_.setInputAction(
            this.selectClickedEntity_.bind(this, SelectionMode.Replace),
            ScreenSpaceEventType.LEFT_CLICK
        );

        if (this.multiple_) {
            this.handler_.setInputAction(
                this.selectClickedEntity_.bind(this, SelectionMode.Toggle),
                ScreenSpaceEventType.LEFT_CLICK,
                KeyboardEventModifier.CTRL
            );

            this.handler_.setInputAction(
                this.selectClickedEntity_.bind(this, SelectionMode.Add),
                ScreenSpaceEventType.LEFT_CLICK,
                KeyboardEventModifier.SHIFT
            );
        }

    }

    selectClickedEntity_(selectionMode, movement) {
        let pickInfo = this.viewer_.scene.pick(movement.position);
        if (pickInfo) {
            let entityId = getPickedFeatureEntity(pickInfo);

            let layer = getPickedLayer(pickInfo);
            if (layer && layer.onLayerPick) {
                let coordinate = this.viewer_.scene.pickPosition(movement.position);
                layer.onLayerPick(coordinate, entityId, pickInfo);
            }

            this.onFeatureSelect_(entityId, selectionMode);
        } else {
            this.onFeatureSelect_( null, selectionMode);
        }
    }

}

cesiumInteractionsFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new CesiumFeatureSelectInteraction(config);
});
