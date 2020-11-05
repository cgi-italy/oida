import { v4 as uuid } from 'uuid';

import { WmsService, WmsLayerPreviewMode } from './wms-service';
import { WmsTimeDistributionProvider } from './wms-time-distribution-provider';
import { getWmsTimeSeriesToolConfig } from './wms-time-series-tool';
import { getWmsLayerRasterView } from './wms-raster-view';
import { DatasetConfig } from '@oida/eo-mobx';

export type WmsDatasetConfig = {
    service: WmsService;
    layerName: string;
};

export const getWmsDatasetConfig = (config: WmsDatasetConfig) => {
    const wmsService = config.service;

    return Promise.all([
        wmsService.getLayerCapabilities(config.layerName),
        wmsService.getLayerPreview(config.layerName, {
            width: 128,
            mode: WmsLayerPreviewMode.KeepRatio
        })
    ]).then(([layer, preview]) => {
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
            mapView: getWmsLayerRasterView(layer, wmsService.getServiceUrl()),
            spatialCoverageProvider: () => Promise.resolve(layer.EX_GeographicBoundingBox),
            timeDistribution: timeDistributionProvider ? {
                provider: timeDistributionProvider
            } : undefined,
            thumb: preview,
            tools: tools
        } as DatasetConfig;
    });
};
