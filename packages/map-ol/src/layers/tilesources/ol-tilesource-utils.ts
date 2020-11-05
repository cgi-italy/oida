import { get as getProjection } from 'ol/proj.js';

import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileGrid from 'ol/tilegrid/TileGrid';

import { TileGridConfig, computeTileGridParams } from '@oida/core';

export const getTileGridFromConfig = (srs, tileGridConfig?: TileGridConfig) => {

    tileGridConfig = tileGridConfig || {};

    let projection = getProjection(srs);

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
        let levelResolution = ((extent[2] - extent[0]) / gridSize[0]) / tileSize[0];
        for (let i = 0; i < (tileGridConfig.maxZoom || 19); ++i) {
            resolutions.push(levelResolution);
            levelResolution /= 2;
        }
    }

    let tileGridOptions = {
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

    let url = sourceConfig.url;

    if (sourceConfig.subdomains) {
        let urls = sourceConfig.subdomains.map((subdomain) => {
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
