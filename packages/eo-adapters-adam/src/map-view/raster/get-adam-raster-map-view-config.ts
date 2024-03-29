import { autorun } from 'mobx';

import { TileLayer } from '@oidajs/state-mobx';
import {
    RasterMapViz,
    RASTER_VIZ_TYPE,
    RasterMapVizConfig,
    RasterBandModeType,
    RasterBandModeChoice,
    DatasetMapViewConfig
} from '@oidajs/eo-mobx';
import { getPlottyColorScales } from '@oidajs/eo-geotiff';

import { AdamWcsDatasetConfig, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { GeotiffLoader } from '../../utils';
import { createAdamRasterTileSourceProvider } from './create-adam-raster-tile-source-provider';
import { AdamSpatialCoverageProvider } from '../../get-adam-dataset-spatial-coverage-provider';

import trueColorPreview from './true-color-preset-preview';

export const getAdamRasterMapViewConfig = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamWcsDatasetConfig,
    spatialCoverageProvider: AdamSpatialCoverageProvider,
    geotiffLoader?: GeotiffLoader
) => {
    let afterInit: ((mapViz: RasterMapViz) => void) | undefined = undefined;

    const { provider, tiffLoader } = createAdamRasterTileSourceProvider(
        factoryConfig,
        datasetConfig,
        spatialCoverageProvider,
        geotiffLoader
    );

    if (tiffLoader) {
        afterInit = (mapViz: RasterMapViz) => {
            autorun(
                () => {
                    const bandMode = mapViz.bandMode.value;
                    if (bandMode?.type === RasterBandModeType.Single) {
                        tiffLoader.renderer.plotty.setColorScale(bandMode.colorMap.colorScale);
                        const domain = bandMode.colorMap.domain;
                        if (domain) {
                            tiffLoader.renderer.plotty.setDomain([domain.mapRange.min, domain.mapRange.max]);
                            tiffLoader.renderer.plotty.setClamp(domain.clamp);
                            tiffLoader.renderer.plotty.setNoDataValue(domain.noDataValue);
                        }

                        mapViz.mapLayer.children.items.forEach((layer) => {
                            (layer as TileLayer).forceRefresh();
                        });
                    }
                },
                {
                    delay: 1000
                }
            );
        };
    }

    const colorScales = getPlottyColorScales();

    let rasterVizconfig: RasterMapVizConfig;

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        if (datasetConfig.coverages.isTrueColor) {
            rasterVizconfig = {
                rasterSourceProvider: provider,
                bandMode: {
                    supportedModes: [
                        {
                            type: RasterBandModeType.Preset
                        }
                    ],
                    presets: [
                        {
                            id: 'tci',
                            name: 'True color image',
                            preview: trueColorPreview
                        }
                    ],
                    defaultMode: 0
                },
                dimensions: datasetConfig.dimensions
            };
        } else {
            const supportedModes: RasterBandModeChoice[] = [
                {
                    type: RasterBandModeType.Single,
                    default: {
                        band: datasetConfig.coverages.bands[0].idx.toString()
                    }
                }
            ];

            let hasPresets = false;
            if (datasetConfig.coverages.presets && datasetConfig.coverages.presets.length) {
                hasPresets = true;
                supportedModes.push({
                    type: RasterBandModeType.Preset,
                    default: {
                        preset: datasetConfig.coverages.presets[0].id
                    }
                });
            }

            supportedModes.push({
                type: RasterBandModeType.Combination
            });

            rasterVizconfig = {
                rasterSourceProvider: provider,
                bandMode: {
                    supportedModes: supportedModes,
                    bands: datasetConfig.coverages.bands.map((band) => {
                        return {
                            id: band.idx.toString(),
                            colorScales: colorScales,
                            ...band
                        };
                    }),
                    bandGroups: datasetConfig.coverages.bandGroups,
                    presets: datasetConfig.coverages.presets,
                    defaultMode: hasPresets ? 1 : 0
                },
                afterInit: afterInit,
                dimensions: datasetConfig.dimensions
            };
        }
    } else {
        rasterVizconfig = {
            rasterSourceProvider: provider,
            bandMode: {
                supportedModes: [
                    {
                        type: RasterBandModeType.Single,
                        default: {
                            band: datasetConfig.coverages[0].id
                        }
                    }
                ],
                bands: datasetConfig.coverages.map((coverage) => {
                    return {
                        colorScales: colorScales,
                        ...coverage
                    };
                }),
                defaultMode: 0
            },
            dimensions: datasetConfig.dimensions,
            afterInit: afterInit
        };
    }

    return {
        type: RASTER_VIZ_TYPE,
        config: rasterVizconfig
    } as DatasetMapViewConfig<typeof RASTER_VIZ_TYPE>;
};
