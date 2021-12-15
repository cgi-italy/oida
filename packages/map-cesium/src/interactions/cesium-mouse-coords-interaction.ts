import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';

import { IMouseCoordsInteraction, IMouseCoordsInteractionProps, MouseCoords, MOUSE_COORDS_INTERACTION_ID } from '@oidajs/core';

import { cesiumInteractionsFactory } from './cesium-interactions-factory';
import { CesiumMapRenderer } from '../map/cesium-map-renderer';

export class CesiumMouseCoordsInteraction implements IMouseCoordsInteraction {

    protected viewer_;
    protected handler_;
    protected onMouseCoords_: (coords: MouseCoords | undefined) => void;
    protected onMouseClick_: (coords: MouseCoords | undefined) => void;
    protected mouseLeaveHandler_: () => void;

    constructor(config: IMouseCoordsInteractionProps<CesiumMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.onMouseCoords_ = config.onMouseCoords;
        this.onMouseClick_ = config.onMouseClick;
        this.mouseLeaveHandler_ = () => {
            this.onMouseCoords_(undefined);
        };
    }

    setActive(active) {
        if (active) {
            this.bindMouseEvents_(this.onMouseCoords_, this.onMouseClick_);
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

    protected bindMouseEvents_(onMouseCoords, onMouseClick) {

        this.handler_ = new ScreenSpaceEventHandler(this.viewer_.scene.canvas);

        this.handler_.setInputAction((movement) => {
            const cartesian = this.viewer_.camera.pickEllipsoid(movement.endPosition, this.viewer_.scene.globe.ellipsoid);
            if (cartesian) {
                onMouseCoords(this.getGeographicCoord_(cartesian));
            } else {
                onMouseCoords(undefined);
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        this.viewer_.scene.canvas.addEventListener('mouseleave', this.mouseLeaveHandler_);

        this.handler_.setInputAction((movement) => {
            const cartesian = this.viewer_.camera.pickEllipsoid(movement.position, this.viewer_.scene.globe.ellipsoid);
            if (cartesian) {
                onMouseClick(this.getGeographicCoord_(cartesian));
            } else {
                onMouseClick(undefined);
            }

        }, ScreenSpaceEventType.LEFT_CLICK);
    }

    protected getGeographicCoord_(cartesian) {
        const cartographic = Cartographic.fromCartesian(cartesian);
        return {
            lon: CesiumMath.toDegrees(cartographic.longitude),
            lat: CesiumMath.toDegrees(cartographic.latitude)
        };
    }

}

cesiumInteractionsFactory.register(MOUSE_COORDS_INTERACTION_ID, (config) => {
    return new CesiumMouseCoordsInteraction(config);
});

