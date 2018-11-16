import dms from 'geodesy/dms';

export const formatLat = (lat: number, config: {format?: string, precision?: number} = {}) => {
    return dms.toLat(lat, config.format, config.precision);
};

export const formatLon = (lon: number, config: {format?: string, precision?: number} = {}) => {
    return dms.toLon(lon, config.format, config.precision);
};
