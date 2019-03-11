import React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import { formatLat, formatLon, MOUSE_COORDS_INTERACTION_ID } from '@oida/core';
import { MouseCoordsInteraction } from '@oida/state-mst';

import { MAP_MODULE_DEFAULT_ID } from '../map-module';
import { inject } from '../../../utils/inject';

import './map-mouse-coords.scss';

export type MapMouseCoordsProps = {
    coords: any;
    format?: string;
    precision?: number;
    className?: string
};


const MapMouseCoordsBase: React.SFC<MapMouseCoordsProps> = ({coords, format, precision, className}) => {
    if (coords) {
        return (
            <div className={classnames('mouse-coords', className)}>
                <span>Lat:</span><span>{formatLat(coords.lat, {format, precision})}</span>
                <span>Lon:</span><span>{formatLon(coords.lon, {format, precision})}</span>
            </div>
        );
    } else {
        return null;
    }
};

MapMouseCoordsBase.defaultProps = {
    format: undefined,
    precision: undefined,
    className: undefined
};

export const MapMouseCoords = observer(MapMouseCoordsBase);

export const MapMouseCoordsS = inject(({appState}) => {

    let map = appState[MAP_MODULE_DEFAULT_ID].map;

    let mouseCoordsInteraction = map.interactions.items.find((interaction) => {
        return interaction.mapInteractionType === MOUSE_COORDS_INTERACTION_ID;
    });

    if (!mouseCoordsInteraction) {
        mouseCoordsInteraction = MouseCoordsInteraction.create({
            id: MOUSE_COORDS_INTERACTION_ID
        });
        map.interactions.add(mouseCoordsInteraction);
    }

    return {
        coords: mouseCoordsInteraction.mouseCoords
    };
})(MapMouseCoords);
