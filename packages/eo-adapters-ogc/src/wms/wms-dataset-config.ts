import { v4 as uuid } from 'uuid';

import { DatasetConfig, DatasetSpatialCoverageProvider } from '@oida/eo-mobx';

import { WmsService } from './wms-service';
import { WmsTimeDistributionProvider } from './wms-time-distribution-provider';
import { getWmsTimeSeriesToolConfig } from './wms-time-series-tool';
import { getWmsLayerRasterView } from './wms-raster-view';


export type WmsDatasetConfig = {
    service: WmsService;
    layerName: string;
    spatialCoverageProvider?: DatasetSpatialCoverageProvider
};

export const getWmsDatasetConfig = (config: WmsDatasetConfig) => {
    const wmsService = config.service;

    return wmsService.getLayerCapabilities(config.layerName).then((layer) => {
        if (!layer || !layer.Name) {
            throw new Error(`No layer with name ${config.layerName}`);
        }

        const timeDimension = layer.Dimension?.find((dimension) => {
            return dimension.name === 'time';
        });

        const timeDistributionProvider = timeDimension
            ? new WmsTimeDistributionProvider({
                timeDimension: timeDimension.values
            })
            : undefined;

        const tools: any[] = [];

        if (timeDistributionProvider && wmsService.isNcWms()) {
            tools.push(getWmsTimeSeriesToolConfig({
                wmsService: wmsService,
                layerName: layer.Name,
                timeDistributionProvider: timeDistributionProvider
            }));
        }

        return {
            id: uuid(),
            name: layer.Title || layer.Name,
            description: layer.Abstract,
            filters: [],
            mapView: getWmsLayerRasterView(layer, wmsService.getServiceUrl(), timeDimension ? config.spatialCoverageProvider : undefined),
            spatialCoverageProvider: timeDimension
                ? config.spatialCoverageProvider || (() => Promise.resolve(layer.EX_GeographicBoundingBox))
                : (() => Promise.resolve(layer.EX_GeographicBoundingBox)),
            timeDistribution: timeDistributionProvider ? {
                provider: timeDistributionProvider
            } : undefined,
            tools: tools
        } as DatasetConfig;
    });
};
