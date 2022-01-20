import { get as getProjection } from 'ol/proj.js';

import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileGrid from 'ol/tilegrid/TileGrid';

import { TileGridConfig, computeTileGridParams } from '@oidajs/core';

export const getTileGridFromConfig = (srs, tileGridConfig?: TileGridConfig) => {
    tileGridConfig = tileGridConfig || {};

    const projection = getProjection(srs);

    let tileSize = Array.isArray(tileGridConfig.tileSize)
        ? tileGridConfig.tileSize
        : [tileGridConfig.tileSize || 256, tileGridConfig.tileSize || 256];

    let gridSize = tileGridConfig.gridSize;
    let extent = tileGridConfig.extent;

    if (!extent) {
        extent = projection.getExtent();
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
        let levelResolution = (extent[2] - extent[0]) / gridSize[0] / tileSize[0];
        // if the root resolution is better than the min res reduce the tile size and use a single level at the best res
        if (tileGridConfig.allowOptimalTileSize && tileGridConfig.minRes && levelResolution < tileGridConfig.minRes) {
            const f = levelResolution / tileGridConfig.minRes;
            tileSize[0] = Math.round(tileSize[0] * f);
            tileSize[1] = Math.round(tileSize[1] * f);
            resolutions.push(tileGridConfig.minRes);
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

    if (tileGridConfig.isWMTS) {
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
