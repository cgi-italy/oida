import moment from 'moment';

import { WmsClient, WmsCapabilities, WmsLayer } from './wms-client';
import { QueryParams, SortOrder } from '@oida/core';

export type WmsServiceConfig = {
    url: string;
    version?: string;
    wmsClient?: WmsClient;
    ncWms?: boolean;
    isGeoserver?: boolean;
};

export enum WmsLayerPreviewMode {
    Stretch = 'stretch',
    KeepRatio = 'keep_ratio',
    Zoom = 'zoom'
}

export type WmsLayerPreviewOptions = {
    mode?: WmsLayerPreviewMode,
    width?: number,
    height?: number,
    transparent?: boolean
};

export type WmsTimeSeriesParams = {
    layer: string,
    position: number[],
    buffer?: number[],
    start: Date,
    end: Date,
    csvParser?: (data: string) => Array<{x: Date, y: number}>
};

export class WmsService {

    protected wmsClient_: WmsClient;
    protected config_: WmsServiceConfig;
    protected globalCapabilities_: Promise<WmsCapabilities> | undefined;
    protected cachedCapabilities_: Record<string, Promise<WmsLayer | undefined>> = {};

    constructor(config: WmsServiceConfig) {
        this.wmsClient_ = config.wmsClient || new WmsClient();
        this.config_ = config;
    }

    getServiceUrl() {
        return this.config_.url;
    }

    getVersion() {
        return this.config_.version;
    }

    isNcWms() {
        return !!this.config_.ncWms;
    }

    getCapabilities() {
        if (!this.globalCapabilities_) {
            this.globalCapabilities_ = new Promise((resolve, reject) => {
                this.wmsClient_.getCapabilities({
                    url: this.config_.url,
                    version: this.config_.version
                }).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    this.globalCapabilities_ = undefined;
                    reject(error);
                });
            });
        }
        return this.globalCapabilities_;
    }

    getLayerCapabilities(layerName: string) {
        // Geoserver support WMS capabilities retrieval for a single layer
        if (this.config_.isGeoserver && !this.globalCapabilities_) {

            if (!this.cachedCapabilities_[layerName]) {

                this.cachedCapabilities_[layerName] = this.wmsClient_.getCapabilities({
                    url: this.getGeoserverLayerNamespacedUrl_(layerName),
                    version: this.config_.version
                }).then((capabilities) => {
                    const rootLayer = capabilities.Capability.Layer;
                    if (rootLayer.Layer) {
                        return rootLayer.Layer[0];
                    } else {
                        return undefined;
                    }
                }).catch((error) => {
                    delete this.cachedCapabilities_[layerName];
                    throw error;
                });
            }

            return this.cachedCapabilities_[layerName];
        } else {
            return this.getCapabilities().then((capabilities) => {
                return this.findLayerCapabilities_(layerName, capabilities.Capability.Layer);
            });
        }
    }

    getTimeSeries(params: WmsTimeSeriesParams) {

        if (!this.config_.ncWms) {
            throw new Error('WmsService: getTimeSeries opeation not supported');
        }

        const buffer = params.buffer || [0.1, 0.2];

        return this.wmsClient_.getTimeSeries({
            url: this.config_.url,
            layers: params.layer,
            styles: '',
            srs: 'EPSG:4326',
            bbox: [
                params.position[1] - buffer[1],
                params.position[0] - buffer[0],
                params.position[1] + buffer[1],
                params.position[0] + buffer[0]
            ],
            width: 64,
            height: 64,
            i: 32,
            j: 32,
            time: `${params.start.toISOString()}/${params.end.toISOString()}`,
            format: 'text/csv'
        }).then((data: string) => {
            if (params.csvParser) {
                return params.csvParser(data);
            } else {
                let rows = data.split('\n');
                let series = rows.map((row) => {
                    try {
                        const [timeStr, valueStr] = row.split(',');
                        const dt = moment.utc(timeStr);
                        const value = parseFloat(valueStr);
                        if (!dt.isValid() || Number.isNaN(value)) {
                            return undefined;
                        }
                        return {
                            x: dt.toDate(),
                            y: value
                        };
                    } catch {
                        return undefined;
                    }
                }).filter(v => !!v);
                return series as Array<{
                    x: Date,
                    y: number
                }>;
            }
        });
    }

    getLayerPreview(layerName: string, options: WmsLayerPreviewOptions = {}) {
        return this.getLayerCapabilities(layerName).then((layer) => {
            if (layer) {

                let width: number, height: number;

                let [miny, minx, maxy, maxx] = layer.EX_GeographicBoundingBox;

                let crs = layer.CRS[0];
                let nativeBBox = layer.BoundingBox.find(bbox => bbox.crs === crs);
                if (!nativeBBox) {
                    crs = 'EPSG:4326';
                } else {
                    [minx, miny, maxx, maxy] = nativeBBox.extent;
                }

                let sizeX = maxx - minx;
                let sizeY = maxy - miny;
                if (crs === 'EPSG:4326') {
                    sizeX = maxy - miny;
                    sizeY = maxx - minx;
                }

                let ratio = sizeX / sizeY;
                if (!options.mode || options.mode === WmsLayerPreviewMode.Stretch) {
                    width = options.width || 128;
                    height = options.height || width;
                } else if (options.mode === WmsLayerPreviewMode.KeepRatio) {
                    if (options.width) {
                        width = options.width;
                        height = width / ratio;
                    } else if (options.height) {
                        height = options.height;
                        width = height * ratio;
                    } else {
                        width = 128;
                        height = width / ratio;
                    }
                } else {
                    //TODO
                    width = options.width || 128;
                    height = options.height || width;
                }

                width = Math.round(width);
                height = Math.round(height);

                const wmsVersion = this.config_.version || '1.3.0';
                const format = options.transparent ? 'image/png' : 'image/jpeg';

                return `${this.config_.url}?service=WMS&version=${wmsVersion}&request=GetMap&layers=${layerName}&format=${format}&${wmsVersion === '1.3.0' ? 'crs' : 'srs'}=${crs}&width=${width}&height=${height}&bbox=${minx},${miny},${maxx},${maxy}&transparent=${options.transparent ? 'true' : 'false'}`;
            } else {
                throw new Error(`WMSService: No layer found with name ${layerName}`);
            }
        });
    }

    getFilteredWmsLayers(queryParams: QueryParams) {
        return this.getCapabilities().then((capabilities) => {
            let layers = this.getLeafLayers_(capabilities.Capability.Layer); //capabilities.Capability.Layer.Layer || [];
            if (queryParams.filters) {
                queryParams.filters.forEach((filter) => {
                    if (filter.key === 'search') {
                        let searchRegex = new RegExp(`${filter.value}`, 'i');
                        layers = layers.filter((layer) => {
                            return (
                                (layer.Name && searchRegex.test(layer.Name))
                                || (layer.Title && searchRegex.test(layer.Title))
                                || (layer.Abstract && searchRegex.test(layer.Abstract))
                            );
                        });
                    }
                });
            }

            const total = layers.length;

            const sortKey = queryParams.sortBy?.key;
            if (sortKey) {
                let order = queryParams.sortBy?.order;
                layers = layers.sort((l1, l2) => {
                    let sort: number;
                    if (l1[sortKey] === l2[sortKey]) {
                        sort = 0;
                    } else if (!l1[sortKey]) {
                        sort = -1;
                    } else if (!l2[sortKey]) {
                        sort = 1;
                    } else if (l1[sortKey] > l2[sortKey]) {
                        sort = 1;
                    } else {
                        sort = -1;
                    }
                    return order === SortOrder.Ascending ? sort : -sort;
                });
            }
            if (queryParams.paging) {
                layers = layers.slice(queryParams.paging.offset, queryParams.paging.offset + queryParams.paging.pageSize);
            }

            return {
                total,
                results: layers
            };
        });
    }

    protected getLeafLayers_(layerNode: WmsLayer, leafLayers: WmsLayer[] = []): WmsLayer[] {
        if (layerNode.Layer) {
            return layerNode.Layer.reduce((layers, childLayer) => {
                return this.getLeafLayers_(childLayer, layers);
            }, leafLayers);
        } else {
            return [...leafLayers, layerNode];
        }

    }

    protected findLayerCapabilities_(layerName: string, layerNode: WmsLayer, result?: WmsLayer) : WmsLayer | undefined {
        if (!layerNode) {
            return undefined;
        }

        if (layerNode.Name === layerName) {
            return layerNode;
        }

        if (layerNode.Layer) {
            return layerNode.Layer.reduce((result, childNode) => {
                return result || this.findLayerCapabilities_(layerName, childNode, result);
            }, result);
        }
        return undefined;
    }

    protected getGeoserverLayerNamespacedUrl_(layerName: string) {
        const workspaceSplit = layerName.split(/:(.+)/).slice(0, 2);
        return this.config_.url.replace(/(ows|wms)(\/?)$/, `${workspaceSplit.join('/')}/$1$2`);
    }
}
