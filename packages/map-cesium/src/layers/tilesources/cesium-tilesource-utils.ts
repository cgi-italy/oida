import { GeographicTilingScheme, WebMercatorTilingScheme, Cartesian2, Rectangle, ImageryProvider, Event } from 'cesium';

import { TileGridConfig, computeTileGridParams, WmtsTileGridConfig } from '@oidajs/core';

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
    const projection = getProjectionType(srs);
    if (projection === ProjectionType.Other) {
        return;
    }

    tileGridConfig = tileGridConfig || {};

    let tileSize = Array.isArray(tileGridConfig.tileSize)
        ? tileGridConfig.tileSize
        : [tileGridConfig.tileSize || 256, tileGridConfig.tileSize || 256];

    let gridSize = tileGridConfig.gridSize;
    const extent = tileGridConfig.extent;

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

    const gridConfig: CesiumTileGridConfig = {
        tileWidth: tileSize[0],
        tileHeight: tileSize[1],
        minimumLevel: tileGridConfig.minZoom || 0,
        tileMatrixLabels: (tileGridConfig as WmtsTileGridConfig).matrixIds
    };

    if (tileGridConfig.maxZoom) {
        gridConfig.maximumLevel = tileGridConfig.maxZoom;
    } else if (tileGridConfig.minRes && extent && gridSize) {
        const rootRes = (extent[2] - extent[0]) / gridSize[0] / tileSize[0];
        gridConfig.maximumLevel = Math.ceil(Math.log2(rootRes / tileGridConfig.minRes));
        if (gridConfig.maximumLevel < 0) {
            gridConfig.maximumLevel = 0;
        }
    } else if (tileGridConfig.resolutions) {
        gridConfig.maximumLevel = tileGridConfig.resolutions.length - 1;
    }

    const tileSchemeConfig: CesiumTileSchemeConfig = {};
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
    } else {
        if (extent) {
            tileSchemeConfig.rectangleSouthwestInMeters = new Cartesian2(extent[0], extent[1]);
            tileSchemeConfig.rectangleNortheastInMeters = new Cartesian2(extent[2], extent[3]);
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
    url = url.replace(/\{-y\}/, '{reverseY}');
    return url;
};

export type CesiumTileSource = ImageryProvider & {
    reload: () => void;
    tileLoadStartEvent: Event;
    tileLoadEndEvent: Event;
};

export const extendImageryProvider = (imageryProvider: ImageryProvider, beforeSourceReload?: () => void) => {
    const source = imageryProvider as CesiumTileSource;
    source.reload = () => {
        if (beforeSourceReload) {
            beforeSourceReload();
        }
        // this is automatically defined by Cesium on the source when the corresponding
        // imagery layer is added to the map (see GlobeSurfaceTileProvider.prototype._onLayerAdded)
        // @ts-ignore
        if (source._reload) {
            // @ts-ignore
            source._reload();
        }
    };
    source.tileLoadStartEvent = new Event();
    source.tileLoadEndEvent = new Event();
    // wrap source requestImage to track tile requests
    const originalRequestImage = source.requestImage;
    source.requestImage = function (...args) {
        const request = originalRequestImage.apply(this, args);
        if (request) {
            this.tileLoadStartEvent.raiseEvent();
            request.finally(() => this.tileLoadEndEvent.raiseEvent());
        }
        return request;
    };
    return source;
};
