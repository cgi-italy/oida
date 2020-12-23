import GeographicProjection from 'cesium/Source/Core/GeographicProjection';
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';

export enum ProjectionType {
    GlobalGeodetic,
    GlobalMercator,
    Other
}

export const getProjectionType = (srs: string) => {

    let projection : ProjectionType;

    switch (srs) {
        case 'EPSG:3785':
        case 'EPSG:3857':
        case 'EPSG:3395':
        case 'EPSG:900913':
            projection = ProjectionType.GlobalMercator;
            break;
        case 'EPSG:4326':
        case 'WGS84':
        case 'CRS:84':
            projection = ProjectionType.GlobalGeodetic;
            break;
        default:
            projection = ProjectionType.Other;
            break;
    }

    return projection;
};

export const getProjectionFromSRS = (srs: string, defaultGeographic = false) => {

    let projection = getProjectionType(srs);

    if (projection === ProjectionType.GlobalGeodetic) {
        return new GeographicProjection();
    } else if (projection === ProjectionType.GlobalMercator) {
        return new WebMercatorProjection();
    } else {
        return defaultGeographic ? new GeographicProjection() : null;
    }
};
