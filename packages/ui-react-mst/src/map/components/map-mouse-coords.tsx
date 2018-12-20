import React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import { formatLat, formatLon } from '@oida/core';

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
