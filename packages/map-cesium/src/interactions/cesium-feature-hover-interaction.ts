import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import KeyboardEventModifier from 'cesium/Source/Core/KeyboardEventModifier';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';

import {
    IFeatureHoverInteractionImplementation,
    IFeatureHoverInteractionProps,
    FEATURE_HOVER_INTERACTION_ID,
    IFeature
} from '@oidajs/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import { getPickInfo, PickInfo, setNonPickableFeaturesVisibility, CesiumFeatureCoordPickMode } from '../utils';

export class CesiumFeatureHoverInteraction implements IFeatureHoverInteractionImplementation {
    private viewer_;
    private handler_;
    private onFeatureHover_: (hovered: IFeature<any> | undefined) => void;

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

    protected bindMove_(onFeatureHover: (hovered: IFeature<any> | undefined) => void) {
        let hoveredFeature: string | undefined = undefined;

        this.handler_ = new ScreenSpaceEventHandler(this.viewer_.scene.canvas);

        let lastPickTime = performance.now();
        const onMouseMove = (movement) => {
            const now = performance.now();
            if (now - lastPickTime < 30) {
                return;
            }
            lastPickTime = now;
            const pickedObjects = this.viewer_.scene.drillPick(movement.endPosition, 10);

            const pickInfo: PickInfo = pickedObjects
                .map((pickedObject) => getPickInfo(pickedObject))
                .find((pickInfo) => !!pickInfo && pickInfo.pickable);

            if (pickInfo) {
                this.viewer_.container.style.cursor = 'pointer';

                const layer = pickInfo.layer;
                if (layer.shouldReceiveFeatureHoverEvents()) {
                    let coordinate: Cartesian3;
                    if (layer.getFeaturePickMode() === CesiumFeatureCoordPickMode.Ellipsoid) {
                        coordinate = this.viewer_.camera.pickEllipsoid(movement.endPosition, this.viewer_.scene.globe.ellipsoid);
                    } else {
                        setNonPickableFeaturesVisibility(pickedObjects, false);
                        this.viewer_.scene.render();
                        coordinate = this.viewer_.scene.pickPosition(movement.endPosition);
                        setNonPickableFeaturesVisibility(pickedObjects, true);
                    }
                    layer.onFeatureHover(coordinate, pickInfo);
                }

                if (pickInfo.id !== hoveredFeature) {
                    onFeatureHover({
                        id: pickInfo.id,
                        data: pickInfo.data
                    });
                    hoveredFeature = pickInfo.id;
                }
            } else {
                this.viewer_.container.style.cursor = '';
                if (hoveredFeature) {
                    onFeatureHover(undefined);
                    hoveredFeature = undefined;
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
