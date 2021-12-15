import XYZSource from 'ol/source/XYZ';

import UrlTemplateImageryProvider from 'cesium/Source/Scene/UrlTemplateImageryProvider';

import { TileGridConfig } from '@oidajs/core';
import { olTileSourcesFactory, getTileGridFromConfig } from '@oidajs/map-ol';
import { cesiumTileSourcesFactory, getTileGridFromSRS } from '@oidajs/map-cesium';

import { AdamServiceParamsSerializer } from '../utils';

export const ADAM_WCS_SOURCE_ID = 'adam_wcs';

export type AdamWcsTileSource = {
    id: typeof ADAM_WCS_SOURCE_ID;
    url: string;
    srs: string;
    coverage: string;
    format: string;
    subsets: string[];
    subdataset?: string;
    tileGrid: TileGridConfig;
    minZoomLevel?: number;
    crossOrigin?: 'anonymous' | 'use-credentials';
    wktFilter?: string;
    tileLoadFunction?: (source: {
        url: string,
        data?: string,
        requestExtent?: number[],
        requestSrs?: string
    }, flip?: boolean) => Promise<string>;
    colortable?: string;
    colorrange?: string;
    requestExtentOffset?: number[];
};


declare module '@oidajs/core' {
    export interface ITileSourceDefinitions {
        [ADAM_WCS_SOURCE_ID]: AdamWcsTileSource;
    }
}


olTileSourcesFactory.register(ADAM_WCS_SOURCE_ID, (config) => {

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
        subdataset: config.subdataset,
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
            } else if (config.srs === 'EPSG:4326') {
                subsets.push(`Lon(${tileExtent[0]},${tileExtent[2]})`);
                subsets.push(`Lat(${tileExtent[1]},${tileExtent[3]})`);
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
                const tileLoadParams = source;
                if (config.srs !== 'unprojected') {
                    tileLoadParams.requestExtent = tileGrid.getTileCoordExtent(tile.getTileCoord());
                    tileLoadParams.srs = config.srs || 'EPSG:4326';
                }
                config.tileLoadFunction(tileLoadParams).then((sourceDataUrl) => {
                    if (sourceDataUrl) {
                        tile.getImage().src = sourceDataUrl;
                    } else {
                        tile.handleImageError_();
                    }
                });
            } else {

                let retryCount = 3;

                const tryImageLoad = () => {

                    const onLoadError = () => {
                        if (retryCount) {
                            retryCount--;
                            // add random timout to avoid rerunning all failing requests together
                            setTimeout(() => {
                                tryImageLoad();
                            }, 1000 + Math.round((Math.random() * 2000)));
                        } else {
                            tile.handleImageError_();
                        }
                    };

                    fetch(source.url).then((response) => {
                        if (!response.ok) {
                            onLoadError();
                        } else {
                            response.blob().then((blob) => {
                                const dataUri = URL.createObjectURL(blob);
                                if (!dataUri) {
                                    onLoadError();
                                } else {
                                    tile.getImage().src = dataUri;
                                }
                            }).catch(() => {
                                onLoadError();
                            });
                        }
                    }, () => {
                        onLoadError();
                    });
                };

                tryImageLoad();
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

cesiumTileSourcesFactory.register(ADAM_WCS_SOURCE_ID, (config) => {
    const tileGrid = getTileGridFromSRS(config.srs || 'EPSG:4326', config.tileGrid);
    if (tileGrid) {

        let wcsParams = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            coverageId: config.coverage,
            subdataset: config.subdataset,
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

                    if (config.srs === 'EPSG:4326') {
                        subsets.push(`Lon(${tileExtent.west},${tileExtent.east})`);
                        subsets.push(`Lat(${tileExtent.south},${tileExtent.north})`);
                    } else {
                        subsets.push(`E(${tileExtent.west},${tileExtent.east})`);
                        subsets.push(`N(${tileExtent.south},${tileExtent.north})`);
                    }

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
                let tileRectangle = tileGrid.scheme.tileXYToNativeRectangle(x, y, level);
                return tileLoadFunction({
                    url: url,
                    requestExtent: [
                        tileRectangle.west,
                        tileRectangle.south,
                        tileRectangle.east,
                        tileRectangle.north,
                    ],
                    requestSrs: config.srs || 'EPSG:4326',
                    data: config.wktFilter
                }).then((data) => {

                    if (!data) {
                        return Promise.reject();
                    }

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
