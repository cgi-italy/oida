import { get as getProjection } from 'ol/proj.js';
import { getWidth, getHeight } from 'ol/extent.js';

import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileGrid from 'ol/tilegrid/TileGrid';

export const getTileGridFromConfig = (srs, tileGridConfig) => {

    tileGridConfig = tileGridConfig || {};

    let projection = getProjection(srs);

    let gridSize;
    let extent;
    if (tileGridConfig.extent) {
        extent = tileGridConfig.extent;
        gridSize = tileGridConfig.gridSize || [1, 1];
    } else {
        extent = projection.getExtent();
        if (!tileGridConfig.gridSize) {
            if (srs === 'EPSG:4326') {
                gridSize = [2, 1];
            } else {
                gridSize = [1, 1];
            }
        } else {
            gridSize = tileGridConfig.gridSize;
        }
    }

    let tileSize = tileGridConfig.tileSize || 256;

    let rootResolution = (getWidth(extent) / gridSize[0]) / tileSize;
    let rootYResolution = (getHeight(extent) / gridSize[1]) / tileSize;

    tileSize = [tileSize, (tileSize * rootYResolution / rootResolution)];

    let matrixIds = tileGridConfig.matrixIds;
    if (!matrixIds) {
        matrixIds = [];
        for (let i = 0; i < (tileGridConfig.maxZoom || 19); ++i) {
            matrixIds.push(i.toString());
        }
    }

    let resolutions = matrixIds.map((id, idx) => {
        return rootResolution / Math.pow(2, idx);
    });

    let tileGridOptions = {
        minZoom: tileGridConfig.minZoom || 0,
        extent: extent,
        tileSize: tileSize,
        resolutions: resolutions,
        matrixIds: matrixIds,
    };

    if (tileGridConfig.isWMTS) {
        return new WMTSTileGrid(tileGridOptions);
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
