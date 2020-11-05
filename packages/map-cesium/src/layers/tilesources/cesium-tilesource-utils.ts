import GeographicTilingScheme from 'cesium/Source/Core/GeographicTilingScheme.js';
import WebMercatorTilingScheme from 'cesium/Source/Core/WebMercatorTilingScheme.js';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Rectangle from 'cesium/Source/Core/Rectangle';

import { TileGridConfig, computeTileGridParams } from '@oida/core';

import { ProjectionType, getProjectionType } from '../../utils/projection';

type CesiumTileSchemeConfig = {
    numberOfLevelZeroTilesX?: number;
    numberOfLevelZeroTilesY?: number;
    rectangle?: Rectangle;
    rectangleSouthwestInMeters?: Cartesian2;
    rectangleNortheastInMeters?: Cartesian2;
};

type CesiumTileGridConfig = {
    tileWidth: number;
    tileHeight: number;
    minimumLevel: number;
    maximumLevel?: number;
    tileMatrixLabels?: string[];
};

export const getTileGridFromSRS = (srs: string, tileGridConfig?: TileGridConfig) => {

    let projection = getProjectionType(srs);
    if (projection === ProjectionType.Other) {
        return;
    }

    tileGridConfig = tileGridConfig || {};

    let tileSize = Array.isArray(tileGridConfig.tileSize)
        ? tileGridConfig.tileSize
        : [tileGridConfig.tileSize || 256, tileGridConfig.tileSize || 256];

    let gridSize = tileGridConfig.gridSize;
    let extent = tileGridConfig.extent;

    if (extent) {
        const gridParams = computeTileGridParams({
            extent,
            tileSize,
            gridSize,
            forceUniformResolution: tileGridConfig.forceUniformResolution
        });

        gridSize = gridParams.gridSize;
        tileSize = gridParams.tileSize;
    }

    let gridConfig: CesiumTileGridConfig = {
        tileWidth: tileSize[0],
        tileHeight: tileSize[1],
        minimumLevel: tileGridConfig.minZoom || 0,
        tileMatrixLabels: tileGridConfig.matrixIds
    };

    if (tileGridConfig.maxZoom) {
        gridConfig.maximumLevel = tileGridConfig.maxZoom;
    } else if (tileGridConfig.resolutions) {
        gridConfig.maximumLevel = tileGridConfig.resolutions.length - 1;
    }

    let tileSchemeConfig: CesiumTileSchemeConfig = {};
    if (gridSize) {
        tileSchemeConfig.numberOfLevelZeroTilesX = gridSize[0];
        tileSchemeConfig.numberOfLevelZeroTilesY = gridSize[1];
    }

    let tilingScheme: GeographicTilingScheme | WebMercatorTilingScheme;

    if (projection === ProjectionType.GlobalGeodetic) {
        if (extent) {
            tileSchemeConfig.rectangle = Rectangle.fromDegrees(...extent);
        }
        tilingScheme = new GeographicTilingScheme(tileSchemeConfig);

    } else if (projection === ProjectionType.GlobalMercator) {
        if (extent) {
            tileSchemeConfig.rectangleSouthwestInMeters = new Cartesian2(extent[0], extent[2]);
            tileSchemeConfig.rectangleNortheastInMeters = new Cartesian2(extent[1], extent[3]);
        }
        tilingScheme = new WebMercatorTilingScheme(tileSchemeConfig);
    }

    return {
        scheme: tilingScheme,
        config: gridConfig
    };

};


export const getUrlFromTemplate = (sourceConfig) => {
    let url = sourceConfig.url;
    if (sourceConfig.layer) {
        url = url.replace(/\{Layer\}/, sourceConfig.layer);
    }
    url = url.replace(/\{\-y\}/, '{reverseY}');
    return url;
};
