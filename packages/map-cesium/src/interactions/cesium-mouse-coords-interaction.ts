import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';

import { IMouseCoordsInteraction, IMouseCoordsInteractionProps, MOUSE_COORDS_INTERACTION_ID } from '@oida/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';

export class CesiumMouseCoordsInteraction implements IMouseCoordsInteraction {

    private viewer_;
    private handler_;
    private onMouseCoords_;
    private mouseLeaveHandler_?;

    constructor(config: IMouseCoordsInteractionProps<CesiumMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.onMouseCoords_ = config.onMouseCoords;
        this.mouseLeaveHandler_ = () => {
            this.onMouseCoords_(null);
        };
    }

    setActive(active) {
        if (active) {
            this.bindMove_(this.onMouseCoords_);
        } else {
            if (this.handler_) {
                try {
                    this.handler_.destroy();
                    this.viewer_.scene.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler_);
                    delete this.handler_;
                } catch (e) {

                }
            }
        }
    }

    destroy() {
        this.setActive(false);
    }

    bindMove_(onMouseCoords) {

        this.handler_ = new ScreenSpaceEventHandler(this.viewer_.scene.canvas);

        this.handler_.setInputAction((movement) => {
            let cartesian = this.viewer_.camera.pickEllipsoid(movement.endPosition, this.viewer_.scene.globe.ellipsoid);
            if (cartesian) {
                let cartographic = Cartographic.fromCartesian(cartesian);
                onMouseCoords({
                    lon: CesiumMath.toDegrees(cartographic.longitude),
                    lat: CesiumMath.toDegrees(cartographic.latitude)
                });
            } else {
                onMouseCoords(null);
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        this.viewer_.scene.canvas.addEventListener('mouseleave', this.mouseLeaveHandler_);
    }
}

cesiumInteractionsFactory.register(MOUSE_COORDS_INTERACTION_ID, (config) => {
    return new CesiumMouseCoordsInteraction(config);
});

