import { TILEJSON_SOURCE_ID, TileSource } from '@oidajs/core';
import {
    BandScalingMode,
    ColorScaleType,
    DatasetMapViewConfig,
    RasterBandModeCombination,
    RasterBandModePreset,
    RasterBandModeSingle,
    RasterBandModeType,
    RasterBandPreset,
    RasterMapViz,
    RasterMapVizConfig,
    RASTER_VIZ_TYPE
} from '@oidajs/eo-mobx';

import {
    PlanetaryComputerApiClient,
    PlanetaryComputerCollections,
    PlanetaryComputerContinousColormaps,
    PLANETARY_COMPUTER_API_URL
} from '../common';

export const PLANETARY_COMPUTER_CREDITS = 'Microsoft Planetary Computer';

export type PlanetaryComputerRasterSourceProviderConfig = {
    apiClient: PlanetaryComputerApiClient;
    /** The collection id */
    collection: keyof typeof PlanetaryComputerCollections;
    /** The item identifier */
    item: string;
};

export const createPlanetaryComputerRasterSourceProvider = (config: PlanetaryComputerRasterSourceProviderConfig) => {
    return (rasterView: RasterMapViz) => {
        const collectionConfig = PlanetaryComputerCollections[config.collection];
        if (!collectionConfig) {
            throw new Error(`Unable to retrieve collection configuration for "${config.collection}"`);
        }
        const bandMode = rasterView.bandMode.value;
        if (bandMode instanceof RasterBandModeSingle) {
            return config.apiClient
                .getDatasetTileJsonConfig({
                    collection: config.collection,
                    dataParameters: {
                        assets: [bandMode.band],
                        colormap_name: bandMode.colorMap.colorScale,
                        format: 'png',
                        rescale: bandMode.colorMap.domain
                            ? `${bandMode.colorMap.domain.mapRange.min},${bandMode.colorMap.domain.mapRange.max}`
                            : undefined
                    },
                    item: config.item,
                    tile_scale: 2
                })
                .then((tileJsonConfig) => {
                    return {
                        config: {
                            id: TILEJSON_SOURCE_ID,
                            tileJsonConfig: tileJsonConfig,
                            credits: PLANETARY_COMPUTER_CREDITS
                        } as TileSource,
                        geographicExtent: tileJsonConfig.bounds,
                        minZoomLevel: collectionConfig.minZoomLevel
                    };
                });
        }
        if (bandMode instanceof RasterBandModePreset) {
            const preset = collectionConfig.presets[bandMode.preset];
            if (!preset) {
                throw new Error(`Unable to retrieve preset parameters for "${bandMode.preset}"`);
            }
            return config.apiClient
                .getDatasetTileJsonConfig({
                    collection: config.collection,
                    dataParameters: preset.dataParameters,
                    item: config.item,
                    tile_scale: 2
                })
                .then((tileJsonConfig) => {
                    return {
                        config: {
                            id: TILEJSON_SOURCE_ID,
                            tileJsonConfig: tileJsonConfig,
                            credits: PLANETARY_COMPUTER_CREDITS
                        } as TileSource,
                        geographicExtent: tileJsonConfig.bounds,
                        minZoomLevel: 6
                    };
                });
        } else if (bandMode instanceof RasterBandModeCombination) {
            let rescale: string | undefined;
            if (bandMode.bandScalingMode === BandScalingMode.Global && bandMode.dataRange) {
                rescale = `${bandMode.dataRange.min},${bandMode.dataRange.max}`;
            }
            return config.apiClient
                .getDatasetTileJsonConfig({
                    collection: config.collection,
                    dataParameters: {
                        assets: [bandMode.red, bandMode.green, bandMode.blue],
                        rescale: rescale
                    },
                    item: config.item,
                    tile_scale: 2
                })
                .then((tileJsonConfig) => {
                    return {
                        config: {
                            id: TILEJSON_SOURCE_ID,
                            tileJsonConfig: tileJsonConfig,
                            credits: PLANETARY_COMPUTER_CREDITS
                        } as TileSource,
                        geographicExtent: tileJsonConfig.bounds,
                        minZoomLevel: 6
                    };
                });
        } else {
            throw new Error('Unsupported band mode selected');
        }
    };
};

export type PlanetaryComputerItemRasterViewConfig = PlanetaryComputerRasterSourceProviderConfig;

export const getPlanetaryComputerItemRasterView = (config: PlanetaryComputerItemRasterViewConfig) => {
    const presets: RasterBandPreset[] = Object.values(PlanetaryComputerCollections[config.collection].presets).map((preset) => {
        return {
            id: preset.id,
            name: preset.name,
            legend: preset.legend,
            preview: preset.preview,
            legendValues: preset.legendValues
        };
    });

    const rasterVizConfig: RasterMapVizConfig = {
        rasterSourceProvider: createPlanetaryComputerRasterSourceProvider(config),
        bandMode: {
            supportedModes: [
                {
                    type: RasterBandModeType.Single
                },
                {
                    type: RasterBandModeType.Preset,
                    default: {
                        preset: presets[0].id
                    }
                },
                {
                    type: RasterBandModeType.Combination,
                    config: {
                        supportBandScalingMode: BandScalingMode.Global
                    }
                }
            ],
            bands: PlanetaryComputerCollections[config.collection].bands.map((band) => {
                return {
                    colorScales: PlanetaryComputerContinousColormaps.map((colormap) => {
                        const legend = new Image();
                        legend.src = `${PLANETARY_COMPUTER_API_URL}/data/v1/legend/colormap/${colormap}`;
                        legend.loading = 'lazy';

                        return {
                            id: colormap,
                            name: colormap,
                            type: ColorScaleType.Parametric,
                            legend: legend
                        };
                    }),
                    domain: {
                        min: 0,
                        max: 10000
                    },
                    default: {
                        colorScale: 'gist_gray'
                    },
                    ...band
                };
            }),
            presets: presets,
            defaultMode: 1
        }
    };

    return {
        type: RASTER_VIZ_TYPE,
        config: rasterVizConfig
    } as DatasetMapViewConfig<typeof RASTER_VIZ_TYPE>;
};
