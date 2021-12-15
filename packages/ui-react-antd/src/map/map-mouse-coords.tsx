import React from 'react';
import classnames from 'classnames';

import { formatLat, formatLon } from '@oidajs/core';

export type MapMouseCoordsProps = {
    coords?: {
        lat: number,
        lon: number
    };
    className?: string;
    formatLat?: (lat: number) => string;
    formatLon?: (lon: number) => string;
};

export const MapMouseCoords = ({coords, className, formatLat, formatLon}: MapMouseCoordsProps) => {
    if (coords) {
        return (
            <div className={classnames('mouse-coords', className)}>
                <span>Lat:</span><span>{formatLat!(coords.lat)}</span>
                <span>Lon:</span><span>{formatLon!(coords.lon)}</span>
            </div>
        );
    } else {
        return null;
    }
};

MapMouseCoords.defaultProps = {
    formatLat: (lat: number) => formatLat(lat, {format: 'dms', precision: 2}),
    formatLon: (lon: number) => formatLon(lon, {format: 'dms', precision: 2})
};

