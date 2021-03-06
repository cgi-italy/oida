import { DatasetPointSeriesConfig, DatasetTimeDistributionProvider, DatasetToolConfig, POINT_SERIES_PROCESSING } from '@oidajs/eo-mobx';
import { WmsService } from './wms-service';

export type WmsTimeSeriesConfig = {
    wmsService: WmsService;
    layerName: string;
    timeDistributionProvider: DatasetTimeDistributionProvider;
};

export const getWmsTimeSeriesToolConfig = (props: WmsTimeSeriesConfig) => {
    const timeSeriesToolConfig: DatasetPointSeriesConfig = {
        variables: [
            {
                id: `${props.layerName}`,
                name: 'Value'
            }
        ],
        dimensions: [
            {
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
            }
        ],
        provider: (request) => {
            if (request.range && !Array.isArray(request.range)) {
                return props.wmsService.getTimeSeries({
                    start: request.range!.min as Date,
                    end: request.range!.max as Date,
                    layer: props.layerName,
                    position: request.location.coordinates
                });
            } else {
                return Promise.reject(new Error('Invalid range provided'));
            }
        }
    };

    return {
        type: POINT_SERIES_PROCESSING,
        name: 'Series analysis',
        config: timeSeriesToolConfig
    } as DatasetToolConfig<typeof POINT_SERIES_PROCESSING>;
};
