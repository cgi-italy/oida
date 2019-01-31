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

export class CesiumFeatureSelectInteraction implements IFeatureSelectInteractionImplementation {

    private viewer_;
    private handler_;
    private onFeatureSelect_;
    private multiple_: boolean;

    constructor(props: IFeatureSelectInteractionProps<CesiumMapRenderer>) {
        this.viewer_ = props.mapRenderer.getViewer();

        this.onFeatureSelect_ = props.onFeatureSelect;
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
        let pick = this.viewer_.scene.pick(movement.position);
        this.onFeatureSelect_(pick ? pick.id : null, selectionMode);
      }

}

cesiumInteractionsFactory.register(FEATURE_SELECT_INTERACTION_ID, (config) => {
    return new CesiumFeatureSelectInteraction(config);
});
