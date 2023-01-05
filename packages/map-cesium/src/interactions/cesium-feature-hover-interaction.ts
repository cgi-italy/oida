import { ScreenSpaceEventHandler, ScreenSpaceEventType, KeyboardEventModifier, CesiumWidget } from 'cesium';

import {
    IFeatureHoverInteractionImplementation,
    IFeatureHoverInteractionProps,
    FEATURE_HOVER_INTERACTION_ID,
    IFeature
} from '@oidajs/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';
import { getPickInfo, PickInfo, pickCoordinate } from '../utils';

export class CesiumFeatureHoverInteraction implements IFeatureHoverInteractionImplementation {
    private viewer_: CesiumWidget;
    private handler_: ScreenSpaceEventHandler | undefined;
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
            // to reduce lagging disable feature hovering if the camera is moving
            // @ts-ignore: need access to camera private member
            if (this.viewer_.scene.camera.timeSinceMoved < 0.2) {
                return;
            }

            // avoid computation at each frame on mouse move
            const now = performance.now();
            if (now - lastPickTime < 30) {
                return;
            }
            lastPickTime = now;
            const pickedObjects = this.viewer_.scene.drillPick(movement.endPosition, 10);

            const pickInfo: PickInfo | undefined = pickedObjects
                .map((pickedObject) => getPickInfo(pickedObject))
                .find((pickInfo) => !!pickInfo && pickInfo.pickable);

            if (pickInfo) {
                (this.viewer_.container as HTMLDivElement).style.cursor = 'pointer';

                const layer = pickInfo.layer;
                if (layer && layer.shouldReceiveFeatureHoverEvents()) {
                    const coordinate = pickCoordinate(this.viewer_, movement.endPosition, layer.getFeaturePickMode(), pickedObjects);
                    if (coordinate) {
                        layer.onFeatureHover(coordinate, pickInfo);
                    }
                }

                if (pickInfo.id !== hoveredFeature) {
                    onFeatureHover({
                        id: pickInfo.id,
                        data: pickInfo.data
                    });
                    hoveredFeature = pickInfo.id;
                }
            } else {
                (this.viewer_.container as HTMLDivElement).style.cursor = '';
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
