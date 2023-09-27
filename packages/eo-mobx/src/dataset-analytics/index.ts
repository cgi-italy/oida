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
import {
    DatasetAreaDistribution,
    DatasetAreaDistributionAnalysis,
    DatasetAreaDistributionProps,
    DATASET_AREA_DISTRIBUTION_PROCESSING
} from './dataset-area-distribution';
import {
    DATASET_VECTOR_FEATURE_LIST_PROCESSING,
    DatasetVectorFeatureList,
    DatasetVectorFeatureListAnalysis,
    DatasetVectorFeatureListProps
} from './dataset-vector-feature-list';

declare module '../common/dataset-viz' {
    interface DatasetVizDefinitions {
        [RASTER_POINT_INFO_PRCESSING]: DatasetRasterPointInfoProps;
        [POINT_SERIES_PROCESSING]: DatasetPointSeriesProps;
        [TRANSECT_VALUES_PROCESSING]: DatasetTransectValuesProps;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAreaValuesProps;
        [DATASET_AREA_SERIES_PROCESSING]: DatasetAreaSeriesProps;
        [DATASET_AREA_DISTRIBUTION_PROCESSING]: DatasetAreaDistributionProps;
        [DATASET_VECTOR_FEATURE_LIST_PROCESSING]: DatasetVectorFeatureListProps;
    }

    interface DatasetVizTypes {
        [RASTER_POINT_INFO_PRCESSING]: DatasetRasterPointInfo;
        [POINT_SERIES_PROCESSING]: DatasetPointSeries;
        [TRANSECT_VALUES_PROCESSING]: DatasetTransectValues;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAreaValues;
        [DATASET_AREA_SERIES_PROCESSING]: DatasetAreaSeries;
        [DATASET_AREA_DISTRIBUTION_PROCESSING]: DatasetAreaDistribution;
        [DATASET_VECTOR_FEATURE_LIST_PROCESSING]: DatasetVectorFeatureList;
    }
}

declare module './dataset-analysis' {
    interface DatasetAnalysisDefinitions {
        [POINT_SERIES_PROCESSING]: DatasetAnalysisProps<typeof POINT_SERIES_PROCESSING, DatasetPointSeries>;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAnalysisProps<typeof DATASET_AREA_VALUES_PROCESSING, DatasetAreaValues>;
        [DATASET_AREA_DISTRIBUTION_PROCESSING]: DatasetAnalysisProps<typeof DATASET_AREA_DISTRIBUTION_PROCESSING, DatasetAreaDistribution>;
        [DATASET_VECTOR_FEATURE_LIST_PROCESSING]: DatasetAnalysisProps<
            typeof DATASET_VECTOR_FEATURE_LIST_PROCESSING,
            DatasetVectorFeatureList
        >;
    }

    interface DatasetAnalysisTypes {
        [POINT_SERIES_PROCESSING]: DatasetPointSeriesAnalysis;
        [DATASET_AREA_VALUES_PROCESSING]: DatasetAreaValuesAnalysis;
        [DATASET_AREA_DISTRIBUTION_PROCESSING]: DatasetAreaDistributionAnalysis;
        [DATASET_VECTOR_FEATURE_LIST_PROCESSING]: DatasetVectorFeatureListAnalysis;
    }
}

DatasetViz.register(POINT_SERIES_PROCESSING, DatasetPointSeries);
DatasetViz.register(RASTER_POINT_INFO_PRCESSING, DatasetRasterPointInfo);
DatasetViz.register(TRANSECT_VALUES_PROCESSING, DatasetTransectValues);
DatasetViz.register(DATASET_AREA_VALUES_PROCESSING, DatasetAreaValues);
DatasetViz.register(DATASET_AREA_SERIES_PROCESSING, DatasetAreaSeries);
DatasetViz.register(DATASET_AREA_DISTRIBUTION_PROCESSING, DatasetAreaDistribution);
DatasetViz.register(DATASET_VECTOR_FEATURE_LIST_PROCESSING, DatasetVectorFeatureList);

DatasetAnalysis.register(POINT_SERIES_PROCESSING, DatasetPointSeriesAnalysis);
DatasetAnalysis.register(DATASET_AREA_VALUES_PROCESSING, DatasetAreaValuesAnalysis);
DatasetAnalysis.register(DATASET_AREA_DISTRIBUTION_PROCESSING, DatasetAreaDistributionAnalysis);
DatasetAnalysis.register(DATASET_VECTOR_FEATURE_LIST_PROCESSING, DatasetVectorFeatureListAnalysis);

export * from './dataset-analytics';
export * from './dataset-analysis';
export * from './dataset-processing';

export * from './dataset-point-series';
export * from './dataset-raster-point-info';
export * from './dataset-transect-values';
export * from './dataset-area-values';
export * from './dataset-area-series';
export * from './dataset-area-distribution';
export * from './dataset-vector-feature-list';

export * from './map-rasters-point-info-analysis';
export * from './grid-scatter-analysis';
