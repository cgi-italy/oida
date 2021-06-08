import { DatasetDimensionSeriesConfig, DatasetTimeDistributionProvider, DatasetToolConfig, DIMENSION_SERIES_TYPE } from '@oida/eo-mobx';
import { WmsService } from './wms-service';

export type WmsTimeSeriesConfig = {
    wmsService: WmsService
    layerName: string,
    timeDistributionProvider: DatasetTimeDistributionProvider
};

export const getWmsTimeSeriesToolConfig = (props: WmsTimeSeriesConfig) => {

    let timeSeriesToolConfig: DatasetDimensionSeriesConfig = {
        supportedGeometries: [{
            type: 'Point'
        }],
        variables: [{
            id: `${props.layerName}`,
            name: 'Value',
        }],
        dimensions: [{
            id: 'time',
            name: 'Time',
            domain: () => {
                return props.timeDistributionProvider.getTimeExtent().then((extent) => {
                    return {
                        min: extent?.start || new Date(0),
                        max: extent?.end || new Date()
                    };
                });
            }
        }],
        provider: (request) => {
            return props.wmsService.getTimeSeries({
                start: request.range!.min as Date,
                end: request.range!.max as Date,
                layer: props.layerName,
                position: (request.geometry as GeoJSON.Point).coordinates,
            });
        }
    };

    return {
        type: DIMENSION_SERIES_TYPE,
        name: 'Series analysis',
        config: timeSeriesToolConfig
    } as DatasetToolConfig<typeof DIMENSION_SERIES_TYPE>;
};
