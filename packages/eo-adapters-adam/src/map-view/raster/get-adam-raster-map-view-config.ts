import { autorun } from 'mobx';

import { AxiosInstanceWithCancellation } from '@oida/core';
import {
    RasterMapViz,
    RASTER_VIZ_TYPE,
    RasterMapVizConfig,
    RasterBandModeType,
} from '@oida/eo-mobx';

import { getPlottyColorScales } from '@oida/eo-geotiff';

import { AdamDatasetConfig, AdamDatasetRenderMode, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { createAdamRasterTileSourceProvider } from './create-adam-raster-tile-source-provider';


export const getAdamRasterMapViewConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {

    let afterInit: ((mapViz: RasterMapViz) => void) | undefined = undefined;

    let useRawData = datasetConfig.renderMode !== AdamDatasetRenderMode.ServerSide;

    const {provider, tiffLoader} = createAdamRasterTileSourceProvider(factoryConfig, datasetConfig, axiosInstance, useRawData);

    if (tiffLoader) {
        afterInit = (mapViz: RasterMapViz) => {
            autorun(() => {
                const bandMode = mapViz.bandMode.value;
                if (bandMode?.type === RasterBandModeType.Single) {
                    tiffLoader.renderer.setColorScale(bandMode.colorMap.colorScale);
                    const domain = bandMode.colorMap.domain;
                    if (domain) {
                        tiffLoader.renderer.setDomain([domain.mapRange.min, domain.mapRange.max]);
                        tiffLoader.renderer.setClamp(domain.clamp);
                        tiffLoader.renderer.setNoDataValue(domain.noDataValue);
                    }


                    mapViz.mapLayer.forceRefresh();
                }
            });
        };
    }

    const colorScales = getPlottyColorScales();

    let rasterVizconfig: RasterMapVizConfig;

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        rasterVizconfig = {
            rasterSourceProvider: provider,
            bandMode: {
                supportedModes: [
                    {
                        type: RasterBandModeType.Single,
                        default: {
                            band: datasetConfig.coverages.bands[0].idx.toString()
                        }
                    },
                    {
                        type: RasterBandModeType.Preset,
                        default: {
                            preset: datasetConfig.coverages.presets[0].id
                        }
                    },
                    {
                        type: RasterBandModeType.Combination
                    }
                ],
                bands: datasetConfig.coverages.bands.map((band) => {
                    return {
                        id: band.idx.toString(),
                        colorScales: colorScales,
                        ...band
                    };
                }),
                bandGroups: datasetConfig.coverages.bandGroups,
                presets: datasetConfig.coverages.presets,
                defaultMode: 1
            },
            afterInit: afterInit,
            dimensions: datasetConfig.dimensions
        };
    } else {
        rasterVizconfig = {
            rasterSourceProvider: provider,
            bandMode: {
                supportedModes: [{
                    type: RasterBandModeType.Single,
                    default: {
                        band: datasetConfig.coverages[0].id
                    }
                }],
                bands: datasetConfig.coverages.map(coverage => {
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
        props: {
            config: rasterVizconfig
        }
    };

};

