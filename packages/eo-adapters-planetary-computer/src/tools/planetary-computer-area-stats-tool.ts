import bboxPolygon from '@turf/bbox-polygon';

import { DatasetAreaValuesConfig, DatasetToolConfig, DATASET_AREA_VALUES_PROCESSING, DatasetAreaValuesProvider } from '@oidajs/eo-mobx';

import { PlanetaryComputerApiClient, PlanetaryComputerCollections } from '../common';

/** Configuration for the {@link createWcsStatsProvider} function */
export type PlanetaryComputerStatsProviderConfig = {
    apiClient: PlanetaryComputerApiClient;
    /** The collection id */
    collection: string;
    /** The collection item id */
    item: string;
};

/**
 * Create a {@link DatasetStatsProvider} that when invoked will use a GetCoverage request to retrieve
 * the dataset raw data in GeoTiff format over the request BBOX, and will compute some statistics.
 *
 * @param config The input configuration object
 */
export const createPlanetaryComputerStatsProvider = (config: PlanetaryComputerStatsProviderConfig) => {
    const provider: DatasetAreaValuesProvider = (request) => {
        const geometry = request.geometry;
        let aoi: GeoJSON.Geometry | undefined;
        if (geometry.type === 'BBox') {
            aoi = bboxPolygon(geometry.bbox).geometry;
        } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            aoi = geometry;
        }

        if (!aoi) {
            return Promise.reject(new Error('Unsupported geometry'));
        }

        return config.apiClient
            .getItemAreaStats({
                aoi: aoi,
                collection: config.collection,
                item: config.item,
                assets: [request.variable],
                percentiles: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99],
                histogramBins: 20
            })
            .then((data) => {
                const stats = data.properties.statistics[request.variable];

                const [histCounts, histBins] = stats.histogram;
                return {
                    stats: {
                        min: stats.min,
                        max: stats.max,
                        mean: stats.mean,
                        sum: stats.sum,
                        median: stats.median,
                        variance: stats.std * stats.std,
                        percentiles: [
                            [1, stats.percentile_1],
                            [5, stats.percentile_5],
                            [10, stats.percentile_10],
                            [15, stats.percentile_15],
                            [20, stats.percentile_20],
                            [25, stats.percentile_25],
                            [30, stats.percentile_30],
                            [35, stats.percentile_35],
                            [40, stats.percentile_40],
                            [45, stats.percentile_45],
                            [50, stats.percentile_50],
                            [55, stats.percentile_55],
                            [60, stats.percentile_60],
                            [70, stats.percentile_70],
                            [75, stats.percentile_75],
                            [80, stats.percentile_80],
                            [85, stats.percentile_85],
                            [90, stats.percentile_90],
                            [95, stats.percentile_95],
                            [99, stats.percentile_99]
                        ],
                        histogram: histCounts.map((count, idx) => {
                            return [
                                histBins[idx] + (histBins[idx + 1] - histBins[idx]) / 2,
                                count,
                                histBins[idx],
                                histBins[idx + 1],
                                `${histBins[idx]} - ${histBins[idx + 1]}`
                            ];
                        })
                    }
                };
            });
    };

    return provider;
};

/**
 * {@link getWcsStatsToolConfig} input properties
 */
export type PlanetaryComputerStatsAnalysisConfig = {
    providerConfig: PlanetaryComputerStatsProviderConfig;
};

/**
 * A function that given the information of a dataset exposed as a WCS (2.0) coverage,
 * generates a corresponding {@link DatasetStatsAnalysis} tool configuration.
 * When invoked The tool will use a GetCoverage request to retrieve the dataset raw data in GeoTiff format
 * over a BBOX, and will compute some statistics.
 *
 * @param props The input properties
 * @return The tool configuration object to be included in the {@link DatasetConfig} tools array
 */
export const getPlanetaryComputerStatsToolConfig = (props: PlanetaryComputerStatsAnalysisConfig) => {
    const provider = createPlanetaryComputerStatsProvider(props.providerConfig);

    const statsToolConfig: DatasetAreaValuesConfig = {
        variables: PlanetaryComputerCollections[props.providerConfig.collection].bands,
        supportedData: {
            stats: true,
            image: false,
            gridValues: false
        },
        supportedGeometries: [
            {
                type: 'BBox'
            },
            {
                type: 'Polygon'
            }
        ],
        dimensions: [],
        provider: provider
    };

    return {
        type: DATASET_AREA_VALUES_PROCESSING,
        name: 'Area statistics',
        config: statsToolConfig
    } as DatasetToolConfig<typeof DATASET_AREA_VALUES_PROCESSING>;
};
