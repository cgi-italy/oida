import { DatasetViz } from '../common';
import { DatasetAnalysis } from './dataset-analysis';

import { RASTER_POINT_INFO_PRCESSING, DatasetRasterPointInfo, DatasetRasterPointInfoProps } from './dataset-raster-point-info';
import { POINT_SERIES_PROCESSING, DatasetPointSeries, DatasetPointSeriesProps, DatasetPointSeriesAnalysis } from './dataset-point-series';
import { TRANSECT_VALUES_PROCESSING, DatasetTransectValues, DatasetTransectValuesProps } from './dataset-transect-values';
import { DATASET_AREA_SERIES_PROCESSING, DatasetAreaSeries, DatasetAreaSeriesProps } from './dataset-area-series';
import {
    DatasetAreaValues,
    DatasetAreaValuesProps,
    DATASET_AREA_VALUES_PROCESSING,
    DatasetAreaValuesAnalysis
} from './dataset-area-values';

declare module '../common/dataset-viz' {
    interface DatasetVizDefinitions {
        [RASTER_POINT_INFO_PRCESSING]: DatasetRasterPointInfoProps;
        [POINT_SERIES_PROCESSING]: DatasetPointSeriesProps;
        [TRANSECT_VALUES_PROCESSING]: DatasetTransectValuesProps;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAreaValuesProps;
        [DATASET_AREA_SERIES_PROCESSING]: DatasetAreaSeriesProps;
    }

    interface DatasetVizTypes {
        [RASTER_POINT_INFO_PRCESSING]: DatasetRasterPointInfo;
        [POINT_SERIES_PROCESSING]: DatasetPointSeries;
        [TRANSECT_VALUES_PROCESSING]: DatasetTransectValues;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAreaValues;
        [DATASET_AREA_SERIES_PROCESSING]: DatasetAreaSeries;
    }
}

declare module './dataset-analysis' {
    interface DatasetAnalysisDefinitions {
        [POINT_SERIES_PROCESSING]: DatasetAnalysisProps<typeof POINT_SERIES_PROCESSING, DatasetPointSeries>;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAnalysisProps<typeof DATASET_AREA_VALUES_PROCESSING, DatasetAreaValues>;
    }

    interface DatasetAnalysisTypes {
        [POINT_SERIES_PROCESSING]: DatasetPointSeriesAnalysis;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAreaValuesAnalysis;
    }
}
DatasetViz.register(POINT_SERIES_PROCESSING, DatasetPointSeries);
DatasetViz.register(RASTER_POINT_INFO_PRCESSING, DatasetRasterPointInfo);
DatasetViz.register(TRANSECT_VALUES_PROCESSING, DatasetTransectValues);
DatasetViz.register(DATASET_AREA_VALUES_PROCESSING, DatasetAreaValues);
DatasetViz.register(DATASET_AREA_SERIES_PROCESSING, DatasetAreaSeries);

DatasetAnalysis.register(POINT_SERIES_PROCESSING, DatasetPointSeriesAnalysis);
DatasetAnalysis.register(DATASET_AREA_VALUES_PROCESSING, DatasetAreaValuesAnalysis);

export * from './dataset-analytics';
export * from './dataset-analysis';
export * from './dataset-processing';

export * from './dataset-point-series';
export * from './dataset-raster-point-info';
export * from './dataset-transect-values';
export * from './dataset-area-values';
export * from './dataset-area-series';

export * from './map-rasters-point-info-analysis';
export * from './grid-scatter-analysis';
