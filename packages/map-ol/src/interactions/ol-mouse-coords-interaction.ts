import { listen, unlistenByKey } from 'ol/events';
import EventType from 'ol/pointer/EventType';
import { transform } from 'ol/proj';

import { IMouseCoordsInteraction, IMouseCoordsInteractionProps, MouseCoords, MOUSE_COORDS_INTERACTION_ID } from '@oidajs/core';

import { olInteractionsFactory } from './ol-interactions-factory';
import { OLMapRenderer } from '../map/ol-map-renderer';

export class OLMouseCoordsInteraction implements IMouseCoordsInteraction {

    private viewer_;
    private evtSubscriptions_;
    private onMouseCoords_: (coords: MouseCoords | undefined) => void;
    private onMouseClick_: (coords: MouseCoords | undefined) => void;

    constructor(config: IMouseCoordsInteractionProps<OLMapRenderer>) {
        this.viewer_ = config.mapRenderer.getViewer();
        this.evtSubscriptions_ = [];
        this.onMouseCoords_ = config.onMouseCoords;
        this.onMouseClick_ = config.onMouseClick;
    }

    setActive(active) {
        if (active) {
            this.bindMove_(this.onMouseCoords_);
            this.bindClick_(this.onMouseClick_);
        } else {
            this.evtSubscriptions_.forEach((subscription) => {
                unlistenByKey(subscription);
            });
            this.evtSubscriptions_ = [];
        }
    }

    destroy() {
        this.setActive(false);
    }

    bindMove_(onMouseCoords: (coords: MouseCoords | undefined) => void) {

        const viewport = this.viewer_.getViewport();

        this.evtSubscriptions_.push(listen(viewport, EventType.POINTERMOVE, (evt) => {
            const px = this.viewer_.getEventPixel(evt);
            const coord = this.viewer_.getCoordinateFromPixel(px);

            if (coord) {
                const geogCoord = this.getGeographicCoord_(coord);

                onMouseCoords({
                    lat: geogCoord[1],
                    lon: geogCoord[0]
                });
            }
        }));

        this.evtSubscriptions_.push(listen(viewport, EventType.POINTEROUT, () => {
            onMouseCoords(undefined);
        }));

    }

    bindClick_(onMouseClick: (coords: MouseCoords | undefined) => void) {
        this.evtSubscriptions_.push(this.viewer_.on('singleclick', (evt) => {
            if (evt.coordinate) {
                const geogCoord = this.getGeographicCoord_(evt.coordinate);
                onMouseClick({
                    lat: geogCoord[1],
                    lon: geogCoord[0]
                });
            } else {
                onMouseClick(undefined);
            }
        }));
    }

    protected getGeographicCoord_(coord: number[]) {
        const proj = this.viewer_.getView().getProjection();
        if (proj.getCode() !== 'EPSG:4326') {
            return transform(coord, proj, 'EPSG:4326');
        } else {
            return coord;
        }
    }
}

olInteractionsFactory.register(MOUSE_COORDS_INTERACTION_ID, (config) => {
    return new OLMouseCoordsInteraction(config);
});

