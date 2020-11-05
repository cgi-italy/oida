import React from 'react';

import { MapCoordQuantity } from '@oida/core';

import { MapMouseCoords } from '@oida/ui-react-antd';

import { useMapMouseCoordsFromModule, useFormatter } from '@oida/ui-react-mobx';


export const MouseCoords = () => {
    const { coords } = useMapMouseCoordsFromModule();

    const formatCoord = useFormatter(MapCoordQuantity);

    const formatLat = formatCoord ? (lat) => {
        return formatCoord(lat, {coordType: 'lat'});
    } : undefined;

    const formatLon = formatCoord ? (lon) => {
        return formatCoord(lon, {coordType: 'lon'});
    } : undefined;

    return (
        <React.Fragment>
            <MapMouseCoords coords={coords} formatLat={formatLat} formatLon={formatLon}/>
        </React.Fragment>
    );
};
