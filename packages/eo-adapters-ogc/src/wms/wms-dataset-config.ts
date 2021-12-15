import { v4 as uuid } from 'uuid';

import {
    DatasetConfig, RASTER_VIZ_TYPE, RasterBandPreset, DatasetToolConfig,
    DatasetSpatialCoverageProvider, DatasetTimeDistributionProvider
} from '@oidajs/eo-mobx';

import { WmsService } from './wms-service';
import { WmsTimeDistributionProvider } from './wms-time-distribution-provider';
import { getWmsTimeSeriesToolConfig } from './wms-time-series-tool';
import { getWmsLayerRasterView, WmsRasterSourceFiltersSerializer, WmsRasterSourceTileGridOptions } from './wms-raster-view';
import { WmsLayerStyle } from './wms-client';

/**
 * The configuration object for the {@Link getWmsDatasetConfig} function
*/
export type WmsDatasetConfig = {
    /** The WMS service */
    service: WmsService;
    /** The WMS layer name */
    layerName: string;
    /**
     * The spatial coverage provider for the dataset. If not specified a default one will be instanciated, using the extent
     * from the WMS layer capabilities
     */
    spatialCoverageProvider?: DatasetSpatialCoverageProvider;
    /** If true any time dimension available on the wms layer will be ignored and no time distribution provider will be instanciated */
    disableTimeDimension?: boolean;
    /**
     * By default if the WMS layer has a time dimension the dataset will be initialized with a {@Link WmsTimeDistributionProvider}
     * It can be overriden here
     */
    timeDistributionProvider?: DatasetTimeDistributionProvider;
    /** See the corresponding option in {@Link WmsLayerRasterViewConfig}*/
    getPresetFromStyle?: (style: WmsLayerStyle) => Partial<RasterBandPreset>;
    /** See the corresponding option in {@Link WmsRasterSourceProviderConfig} */
    tileGridOptions?: WmsRasterSourceTileGridOptions;
    /** See the corresponding option in {@Link WmsRasterSourceProviderConfig} */
    additionalFiltersSerializer?: WmsRasterSourceFiltersSerializer,
};

/**
 * Get the EO dataset configuration for a WMS layer. Additional information will be retrieved through a getCapabilities request.
 * If the layer present a time dimension, it will be used to enable time exploration (and in case of ncWMS for time series operations)
 * @params config: the request configuration object
 * @return The dataset configuration object. It can be used as input to the {@Link DatasetExplorer.addDataset} method
*/
export const getWmsDatasetConfig = (config: WmsDatasetConfig) => {
    const wmsService = config.service;

    return wmsService.getLayerCapabilities(config.layerName).then((layer) => {
        if (!layer || !layer.Name) {
            throw new Error(`No layer with name ${config.layerName}`);
        }

        const timeDimension = layer.Dimension?.find((dimension) => {
            return dimension.name === 'time';
        });

        const timeDistributionProvider = timeDimension && !config.disableTimeDimension
            ? new WmsTimeDistributionProvider({
                timeDimension: timeDimension.values
            })
            : undefined;

        const tools: DatasetToolConfig[] = [];

        if (timeDistributionProvider && wmsService.isNcWms()) {
            tools.push(getWmsTimeSeriesToolConfig({
                wmsService: wmsService,
                layerName: config.layerName,
                timeDistributionProvider: timeDistributionProvider
            }));
        }

        // wrap the provided spatial coverage provider (if any), and fallback to WMS layer
        // extent in case it fails to provide the geographic extent
        const spatialCoverageProvider: DatasetSpatialCoverageProvider = (datasetViz) => {
            if (config.spatialCoverageProvider) {
                return config.spatialCoverageProvider(datasetViz).then((geographicExtent) => {
                    return geographicExtent || layer.EX_GeographicBoundingBox;
                }).catch(() => {
                    return layer.EX_GeographicBoundingBox;
                });
            } else {
                return Promise.resolve(layer.EX_GeographicBoundingBox);
            }
        };

        return {
            id: uuid(),
            name: layer.Title || layer.Name,
            description: layer.Abstract,
            filters: [],
            mapView: getWmsLayerRasterView({
                layer: {
                    ...layer,
                    Name: config.layerName // the layer name from capaibilities may not include the namespace
                },
                wmsServiceUrl: config.service.getServiceUrl(),
                wmsVersion: config.service.getVersion(),
                spatialCoverageProvider: spatialCoverageProvider,
                getPresetFromStyle: config.getPresetFromStyle,
                additionalFiltersSerializer: config.additionalFiltersSerializer,
                tileGridOptions: config.tileGridOptions

            }),
            spatialCoverageProvider: spatialCoverageProvider,
            timeDistribution: timeDistributionProvider ? {
                provider: timeDistributionProvider
            } : undefined,
            tools: tools
        } as DatasetConfig<typeof RASTER_VIZ_TYPE>;
    });
};
