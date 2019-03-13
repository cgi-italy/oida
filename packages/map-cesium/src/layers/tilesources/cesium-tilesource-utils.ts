import { ProjectionType, getProjectionType } from '../../utils/projection';

import GeographicTilingScheme from 'cesium/Source/Core/GeographicTilingScheme.js';
import WebMercatorTilingScheme from 'cesium/Source/Core/WebMercatorTilingScheme.js';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Rectangle from 'cesium/Source/Core/Rectangle';

export const getTileGridFromSRS = (srs, tileGridConfig?) => {

    let tileSchemeConfig: any = {
    };

    let additionalConfig: any = {
        tileWidth: 256,
        tileHeight: 256,
        minimumLevel: 0
    };

    if (tileGridConfig) {
        if (tileGridConfig.tileSize) {
            additionalConfig.tileWidth = tileGridConfig.tileSize;
            additionalConfig.tileHeight = tileGridConfig.tileSize;
        }
        if (tileGridConfig.minZoom) {
            additionalConfig.minimumLevel = tileGridConfig.minZoom;
        }
        if (tileGridConfig.maxZoom) {
            additionalConfig.maximumLevel = tileGridConfig.maxZoom;
        }
        if (tileGridConfig.gridSize) {
            tileSchemeConfig.numberOfLevelZeroTilesX = tileGridConfig.gridSize[0];
            tileSchemeConfig.numberOfLevelZeroTilesY = tileGridConfig.gridSize[1];
        }
    }

    let tileGrid = null;
    let projection = getProjectionType(srs);

    if (projection === ProjectionType.GlobalGeodetic) {
        if (tileGridConfig) {
            if (tileGridConfig.extent) {
                tileSchemeConfig.rectangle = Rectangle.fromDegrees(...tileGridConfig.extent);
            }
        }
        tileGrid = {
            scheme: new GeographicTilingScheme(tileSchemeConfig)
        };

    } else if (projection === ProjectionType.GlobalMercator) {
        if (tileGridConfig) {
            if (tileGridConfig.extent) {
                tileSchemeConfig.rectangleSouthwestInMeters = new Cartesian2(tileGridConfig.extent[0], tileGridConfig.extent[2]);
                tileSchemeConfig.rectangleNortheastInMeters = new Cartesian2(tileGridConfig.extent[1], tileGridConfig.extent[3]);
            }
        }
        tileGrid = {
            scheme: new WebMercatorTilingScheme(tileSchemeConfig)
        };

    }

    if (tileGrid) {
        tileGrid.config = additionalConfig;
    }

    return tileGrid;
};


export const getUrlFromTemplate = (sourceConfig) => {
    let url = sourceConfig.url;
    if (sourceConfig.layer) {
        url = url.replace(/\{Layer\}/, sourceConfig.layer);
    }
    url = url.replace(/\{\-y\}/, '{reverseY}');
    return url;
};
