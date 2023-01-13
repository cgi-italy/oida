import { get as getProjection } from 'ol/proj.js';

import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileSource from 'ol/source/Tile';
import TileImageSource from 'ol/source/TileImage';

import { TileGridConfig, isWmtsTileGridConfig, computeTileGridParams } from '@oidajs/core';

const getRootLevelResolution = (extent: number[], gridSize: number[], tileSize: number[]) => {
    const rootXResolution = (extent[2] - extent[0]) / gridSize[0] / tileSize[0];
    const rootYResolution = (extent[3] - extent[1]) / gridSize[1] / tileSize[1];
    return Math.max(rootXResolution, rootYResolution);
};

export const getTileGridFromConfig = (srs, tileGridConfig?: TileGridConfig): TileGrid => {
    tileGridConfig = tileGridConfig || {};

    const projection = getProjection(srs);

    let tileSize = Array.isArray(tileGridConfig.tileSize)
        ? tileGridConfig.tileSize
        : [tileGridConfig.tileSize || 256, tileGridConfig.tileSize || 256];

    let gridSize = tileGridConfig.gridSize;
    let extent = tileGridConfig.extent;

    if (!extent) {
        extent = projection?.getExtent();
    }

    if (!extent) {
        throw new Error('No extent provided for tile layer');
    }

    const gridParams = computeTileGridParams({
        extent,
        tileSize,
        gridSize,
        forceUniformResolution: tileGridConfig.forceUniformResolution
    });

    gridSize = gridParams.gridSize;
    tileSize = gridParams.tileSize;

    let resolutions = tileGridConfig.resolutions;
    if (!resolutions) {
        resolutions = [];
        let levelResolution = getRootLevelResolution(extent, gridSize, tileSize);
        // if the root resolution is better than the min res reduce the tile size and use a single level at the best res
        if (tileGridConfig.allowOptimalTileSize && tileGridConfig.minRes && levelResolution < tileGridConfig.minRes) {
            const tileScaleFactor = levelResolution / tileGridConfig.minRes;
            tileSize[0] = Math.round(tileSize[0] * tileScaleFactor);
            tileSize[1] = Math.round(tileSize[1] * tileScaleFactor);
            resolutions.push(getRootLevelResolution(extent, gridSize, tileSize));
        } else {
            resolutions.push(levelResolution);
            for (let i = 1; i <= (tileGridConfig.maxZoom || 19); ++i) {
                levelResolution /= 2;
                resolutions.push(levelResolution);
                if (tileGridConfig.minRes && levelResolution < tileGridConfig.minRes) {
                    break;
                }
            }
        }
    }

    const tileGridOptions = {
        minZoom: tileGridConfig.minZoom || 0,
        extent: extent,
        tileSize: tileSize,
        resolutions: resolutions
    };

    if (isWmtsTileGridConfig(tileGridConfig)) {
        let matrixIds = tileGridConfig.matrixIds;
        if (!matrixIds) {
            matrixIds = resolutions.map((resolution, idx) => {
                return idx.toString();
            });
        }
        return new WMTSTileGrid({
            ...tileGridOptions,
            matrixIds: matrixIds
        });
    } else {
        return new TileGrid(tileGridOptions);
    }
};

export const getUrlFromConfig = (sourceConfig) => {
    const url = sourceConfig.url;

    if (sourceConfig.subdomains) {
        const urls = sourceConfig.subdomains.map((subdomain) => {
            return url.replace(/\{s\}/, subdomain);
        });
        return {
            urls
        };
    } else {
        return {
            url
        };
    }
};

export enum TileRefreshMode {
    Clear,
    KeepCurrentZLevel,
    KeepAll
}
/**
 * Force a tile source refresh.
 * Cache is invalidated and map tiles data is requested again from the source
 * @param tileSource The source to refresh
 * @param refreshMode Specify the map tile refresh mode.
 * When set to {@link TileRefreshMode.KeepCurrentZLevel} (the default) the source is refreshed without clearing
 * the current level cache. (Current tiles will not disappear from the map, but updated asynchronously)
 * When set to {@link TileRefreshMode.Clear}, the cache is cleared before refreshing (The map layer will disappear and tiles
 * loaded again)
 * When set to {@link TileRefreshMode.KeepAll}, the cache is not invalidated. Old cached tiles will be updated once loaded
 * on the map
 */
export const refreshTileSource = (tileSource: TileSource, refreshMode = TileRefreshMode.KeepCurrentZLevel) => {
    if (refreshMode === TileRefreshMode.KeepCurrentZLevel) {
        const sourceKey = new Date().toISOString();
        // we're using some protected methods so the ts-ignore directives
        if (tileSource instanceof TileImageSource) {
            // @ts-ignore
            const tileCaches = tileSource.tileCacheForProjection;
            for (const key in tileCaches) {
                tileCaches[key].pruneExceptNewestZ();
            }
        } else {
            // @ts-ignore
            tileSource.tileCache.pruneExceptNewestZ();
        }
        // @ts-ignore
        tileSource.setKey(sourceKey);
    } else if (refreshMode === TileRefreshMode.Clear) {
        tileSource.refresh();
    } else {
        const sourceKey = new Date().toISOString();
        // @ts-ignore
        tileSource.setKey(sourceKey);
    }
};
