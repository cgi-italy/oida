import { listen, unlisten } from 'ol/events';
import EventType from 'ol/events/EventType';
import { transform } from 'ol/proj';

import { IMouseCoordsInteraction, IMouseCoordsInteractionProps, MOUSE_COORDS_INTERACTION_ID } from '@oida/core';

import { olInteractionsFactory } from './ol-interactions-factory';
import { OLMapRenderer } from '../map/ol-map-renderer';

export class OLMouseCoordsInteraction implements IMouseCoordsInteraction {

    private viewer_;
    private evtSubscriptions_;
    private onMouseCoords_;

    constructor(config: IMouseCoordsInteractionProps<OLMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.evtSubscriptions_ = [];
        this.onMouseCoords_ = config.onMouseCoords;
    }

    setActive(active) {
        if (active) {
            this.bindMove_(this.onMouseCoords_);
        } else {
            this.evtSubscriptions_.forEach((subscription) => {
                unlisten(subscription.target, subscription.type, subscription.listener);
            });
            this.evtSubscriptions_ = [];
        }
    }

    destroy() {
        this.setActive(false);
    }

    bindMove_(onMouseCoords) {

        let viewport = this.viewer_.getViewport();

        this.evtSubscriptions_.push(listen(viewport, EventType.MOUSEMOVE, (evt) => {
            let px = this.viewer_.getEventPixel(evt);
            let coord = this.viewer_.getCoordinateFromPixel(px);

            let proj = this.viewer_.getView().getProjection();
            if (proj.getCode() !== 'EPSG:4326') {
                coord = transform(coord, proj, 'EPSG:4326');
            }

            onMouseCoords({
                lat: coord[1],
                lon: coord[0]
            });
        }));

        this.evtSubscriptions_.push(listen(viewport, EventType.MOUSEOUT, () => {
            onMouseCoords(null);
        }));

    }
}

olInteractionsFactory.register(MOUSE_COORDS_INTERACTION_ID, (config) => {
    return new OLMouseCoordsInteraction(config);
});

