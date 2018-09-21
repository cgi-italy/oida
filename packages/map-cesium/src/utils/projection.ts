import GeographicProjection from 'cesium/Source/Core/GeographicProjection';
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';
import GeographicTilingScheme from 'cesium/Source/Core/GeographicTilingScheme.js';
import WebMercatorTilingScheme from 'cesium/Source/Core/WebMercatorTilingScheme.js';


enum ProjectionType {
    GlobalGeodetic,
    GlobalMercator,
    Other
}

const getProjectionType = (srs) => {

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
            projection = ProjectionType.GlobalGeodetic;
            break;
        default:
            projection = ProjectionType.Other;
            break;
    }

    return projection;
};

export const getProjectionFromSRS = (srs, defaultGeographic = false) => {

    let projection = getProjectionType(srs);

    if (projection === ProjectionType.GlobalGeodetic) {
        return new GeographicProjection();
    } else if (projection === ProjectionType.GlobalMercator) {
        return new WebMercatorProjection();
    } else {
        return defaultGeographic ? new GeographicProjection() : null;
    }
};


export const getTileSchemeFromSRS = (srs) => {

    let projection = getProjectionType(srs);

    if (projection === ProjectionType.GlobalGeodetic) {
        return new GeographicTilingScheme();
    } else if (projection === ProjectionType.GlobalMercator) {
        return new WebMercatorTilingScheme();
    } else {
        return null;
    }
};
