import dms from 'geodesy/dms';

import { FormatterQuantity } from './formatter';

export const formatLat = (lat: number, config: {format?: string, precision?: number} = {}) => {
    return dms.toLat(lat, config.format, config.precision);
};

export const formatLon = (lon: number, config: {format?: string, precision?: number} = {}) => {
    return dms.toLon(lon, config.format, config.precision);
};

export type MapCoordFormatterOptions = {
    coordType: 'lat' | 'lon';
    format: 'dms' | 'dec';
    precision?: number;
};

export const MapCoordQuantity: FormatterQuantity<number, MapCoordFormatterOptions> = {
    id: 'coord'
};

export const formatMapCoord = (
    coord: number,
    options: MapCoordFormatterOptions
)  => {

    let { format, coordType, ...formatOptions} = options;
    if (format === 'dms') {
        if (coordType === 'lat') {
            return formatLat(coord, {
                format: 'dms',
                ...formatOptions
            });
        } else if (coordType === 'lon') {
            return formatLon(coord, {
                format: 'dms',
                ...formatOptions
            });
        }
    } else if (format === 'dec') {
        return coord.toFixed(formatOptions.precision);
    }
};
