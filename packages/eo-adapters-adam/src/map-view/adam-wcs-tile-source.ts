import XYZSource from 'ol/source/XYZ';
import UrlTemplateImageryProvider from 'cesium/Source/Scene/UrlTemplateImageryProvider';

import { TileGridConfig } from '@oida/core';
import { olTileSourcesFactory, getTileGridFromConfig } from '@oida/map-ol';
import { cesiumTileSourcesFactory, getTileGridFromSRS } from '@oida/map-cesium';

import { AdamServiceParamsSerializer } from '../utils';

export const ADAM_WCS_SOURCE_ID = 'adam_wcs';

export type AdamWcsTileSourceConfig = {
    url: string;
    srs: string;
    coverage: string;
    format: string;
    subsets: string[];
    tileGrid: TileGridConfig;
    minZoomLevel?: number;
    crossOrigin?: boolean;
    wktFilter?: string;
    tileLoadFunction?: (source: {url: string, data?: string}, flip?: boolean) => Promise<string>;
    colortable?: string;
    colorrange?: string;
    requestExtentOffset?: number[];
    wrapX?: boolean
};

olTileSourcesFactory.register(ADAM_WCS_SOURCE_ID, (config: AdamWcsTileSourceConfig) => {

    let tileGrid = getTileGridFromConfig(config.srs, config.tileGrid);
    let tileSize = tileGrid.getTileSize();

    let wcsParams = {
        service: 'WCS',
        request: 'GetCoverage',
        version: '2.0.0',
        coverageId: config.coverage,
        format: config.format,
        colorrange: config.colorrange,
        colortable: config.colortable,
        size: `(${tileSize})`
    };

    return new XYZSource({
        tileUrlFunction: (tileCoord, ratio, projection) => {
            let tileExtent = tileGrid.getTileCoordExtent(tileCoord);

            if (config.requestExtentOffset) {
                tileExtent[0] += config.requestExtentOffset[0];
                tileExtent[2] += config.requestExtentOffset[0];
                tileExtent[1] += config.requestExtentOffset[1];
                tileExtent[3] += config.requestExtentOffset[1];
            }

            let subsets = (config.subsets || []).slice();

            if (config.srs === 'unprojected') {
                subsets.push(`y(${tileExtent[0]},${tileExtent[2]})`);
                subsets.push(`x(${tileExtent[1]},${tileExtent[3]})`);
            } else {
                subsets.push(`E(${tileExtent[0]},${tileExtent[2]})`);
                subsets.push(`N(${tileExtent[1]},${tileExtent[3]})`);
            }

            return {
                url: `${config.url}?${AdamServiceParamsSerializer({
                    ...wcsParams,
                    subset: subsets
                })}`,
                data: config.wktFilter
            };
        },
        tileLoadFunction: ((tile, source) => {
            if (config.tileLoadFunction) {
                config.tileLoadFunction(source).then((sourceDataUrl) => {
                    tile.getImage().src = sourceDataUrl;
                });
            } else {
                tile.getImage().src = source.url;
            }
        }),
        crossOrigin: config.crossOrigin,
        tileGrid: tileGrid,
        projection: config.srs,
        wrapX: config.wrapX
    });
});


function cesiumBuildImageResource(imageryProvider, x, y, level, request) {

    let resource = imageryProvider._resource;
    let url = resource.getUrlComponent(true);
    let allTags = imageryProvider._tags;
    let templateValues = {};

    let templateRegex = /{[^}]+}/g;

    let match = url.match(templateRegex);
    if (match !== undefined) {
        match.forEach(function(tag) {
            let key = tag.substring(1, tag.length - 1);
            if (allTags[key] !== undefined) {
                templateValues[key] = allTags[key](imageryProvider, x, y, level);
            }
        });
    }

    return resource.getDerivedResource({
        request: request,
        templateValues: templateValues
    });
}

cesiumTileSourcesFactory.register(ADAM_WCS_SOURCE_ID, (config: AdamWcsTileSourceConfig) => {
    const tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {

        let wcsParams = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            coverageId: config.coverage,
            format: config.format,
            colorrange: config.colorrange,
            colortable: config.colortable,
            size: `(${tileGrid.config.tileWidth},${tileGrid.config.tileHeight})`
        };

        const tileSource =  new UrlTemplateImageryProvider({
            url: `${config.url}?{wcsParams}`,
            enablePickFeatures: false,
            tilingScheme: tileGrid.scheme,
            customTags: {
                wcsParams: (provider, x, y, level) => {
                    let tileExtent = tileGrid.scheme.tileXYToNativeRectangle(x, y, level);
                    let subsets = (config.subsets || []).slice();

                    if (config.requestExtentOffset) {
                        tileExtent.west += config.requestExtentOffset[0];
                        tileExtent.east += config.requestExtentOffset[0];
                        tileExtent.south += config.requestExtentOffset[1];
                        tileExtent.north += config.requestExtentOffset[1];
                    }

                    subsets.push(`E(${tileExtent.west},${tileExtent.east})`);
                    subsets.push(`N(${tileExtent.south},${tileExtent.north})`);

                    return AdamServiceParamsSerializer({
                        ...wcsParams,
                        subset: subsets
                    });
                }
            },
            ...tileGrid.config
        });

        const tileLoadFunction = config.tileLoadFunction;
        if (tileLoadFunction) {
            tileSource.requestImage = function(x, y, level, request) {
                let resource = cesiumBuildImageResource(this, x, y, level, request);
                let url = resource.getUrlComponent(true);
                return tileLoadFunction({url: url, data: config.wktFilter}).then((data) => {

                    return new Promise((resolve, reject) => {
                        let img = new Image();
                        img.src = data;

                        img.onload = () => {
                            resolve(img);
                        };

                        img.onerror = () => {
                            reject();
                        };
                    });
                });
            };
        }

        return tileSource;

    }
});
