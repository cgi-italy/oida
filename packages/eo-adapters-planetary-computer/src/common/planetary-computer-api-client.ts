import moment from 'moment';

import { AxiosInstanceWithCancellation, createAxiosInstance } from '@oidajs/core';

import { PlanetaryComputerUrlParamSerializer } from './planetary-computer-url-param-serializer';

export const PLANETARY_COMPUTER_API_URL = 'https://planetarycomputer.microsoft.com/api';

export type PlanetaryComputerApiClientConfig = {
    axiosInstance?: AxiosInstanceWithCancellation;
};

export type PlanetaryComputerDataParamaters = {
    assets?: string[];
    color_formula?: string;
    format?: string;
    nodata?: number;
    rescale?: string | string[];
    colormap_name?: string;
    expression?: string;
    asset_as_band?: boolean;
};

export type PlanetaryComputerTileJsonConfigRequest = {
    collection: string;
    item: string;
    dataParameters: PlanetaryComputerDataParamaters;
    tile_scale?: number;
};

export type PlanetaryComputerPointInfoRequest = {
    collection: string;
    item: string;
    location: number[];
    assets: string[];
};

export type PlanetaryComputerPointInfoResponse = {
    coordinates: number[];
    values: number[];
    band_names: string[];
};

export type PlanetaryComputerAreaStatsRequest = {
    collection: string;
    item: string;
    aoi: GeoJSON.Geometry;
    assets?: string[];
    percentiles?: number[];
    histogramBins?: number | number[];
};

export type PlanetaryComputerAssetStats = {
    min: number;
    max: number;
    mean: number;
    std: number;
    sum: number;
    median: number;
    histogram: [number[], number[]];
} & Record<string, number>;

export type PlanetaryComputerAreaStatsResponse = GeoJSON.Feature<
    GeoJSON.Geometry,
    {
        statistics: Record<string, PlanetaryComputerAssetStats>;
    }
>;

export class PlanetaryComputerApiClient {
    private axiosInstance_: AxiosInstanceWithCancellation;

    constructor(config: PlanetaryComputerApiClientConfig) {
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
    }

    /**
     * Search collection item by identifier
     *
     * @param collection The collection id
     * @param identifier The identifier search string (will be used in a LIKE clause)
     * @param startTime The item start time. In principle it shouldn't be necessary but without
     * it the API will go in timeout
     * @returns The STAC item
     */
    public getItemFromIdentifier(collection: string, identifier: string, startTime: string) {
        return this.axiosInstance_
            .post(`${PLANETARY_COMPUTER_API_URL}/stac/v1/search`, {
                'filter-lang': 'cql2-json',
                limit: 1,
                filter: {
                    op: 'and',
                    args: [
                        {
                            op: '=',
                            args: [{ property: 'collection' }, collection]
                        },
                        {
                            op: 'like',
                            args: [
                                {
                                    property: 'id'
                                },
                                `%${identifier}%`
                            ]
                        },
                        {
                            op: 'anyinteracts',
                            args: [
                                { property: 'datetime' },
                                {
                                    interval: [
                                        moment.utc(startTime).startOf('day').toISOString(),
                                        moment.utc(startTime).endOf('day').toISOString()
                                    ]
                                }
                            ]
                        }
                    ]
                }
            })
            .then((response) => {
                return response.data.features[0];
            });
    }

    public getDatasetTileJsonConfig(request: PlanetaryComputerTileJsonConfigRequest) {
        return this.axiosInstance_
            .get(`${PLANETARY_COMPUTER_API_URL}/data/v1/item/tilejson.json`, {
                params: {
                    collection: request.collection,
                    item: request.item,
                    tile_scale: request.tile_scale,
                    ...request.dataParameters
                },
                paramsSerializer: {
                    serialize: PlanetaryComputerUrlParamSerializer
                }
            })
            .then((response) => {
                return response.data;
            });
    }

    public getItemAreaStats(request: PlanetaryComputerAreaStatsRequest): Promise<PlanetaryComputerAreaStatsResponse> {
        return this.axiosInstance_
            .post<PlanetaryComputerAreaStatsResponse>(
                `${PLANETARY_COMPUTER_API_URL}/data/v1/item/statistics`,
                {
                    type: 'Feature',
                    geometry: request.aoi,
                    properties: {}
                },
                {
                    params: {
                        collection: request.collection,
                        item: request.item,
                        assets: request.assets,
                        asset_as_band: true,
                        p: request.percentiles,
                        histogram_bins: Array.isArray(request.histogramBins) ? request.histogramBins.join(',') : request.histogramBins
                    },
                    paramsSerializer: {
                        serialize: PlanetaryComputerUrlParamSerializer
                    }
                }
            )
            .then((response) => {
                return response.data;
            });
    }

    public getItemPointInfo(request: PlanetaryComputerPointInfoRequest) {
        return this.axiosInstance_
            .get<PlanetaryComputerPointInfoResponse>(
                `${PLANETARY_COMPUTER_API_URL}/data/v1/item/point/${request.location[0]},${request.location[1]}`,
                {
                    params: {
                        collection: request.collection,
                        item: request.item,
                        assets: request.assets,
                        asset_as_band: true
                    },
                    paramsSerializer: {
                        serialize: PlanetaryComputerUrlParamSerializer
                    }
                }
            )
            .then((response) => {
                return response.data;
            });
    }
}
