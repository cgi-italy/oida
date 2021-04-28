import { DatasetViz } from './dataset-viz';
import { RASTER_VIZ_TYPE, RasterMapViz, RasterMapVizProps } from './raster-map-viz';
import { VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz, DatasetVerticalProfileVizProps } from './vertical-profile-viz';
import { VOLUMETRIC_VIZ_TYPE, DatasetVolumetricViz, DatasetVolumetricVizProps } from './volumetric-map-viz';
import { DIMENSION_SERIES_TYPE, DatasetDimensionSeriesProps, DatasetDimensionSeries } from './dataset-dimension-series';
import { TRANSECT_SERIES_TYPE, DatasetTransectSeries, DatasetTransectSeriesProps } from './dataset-transect-series';
import { STATS_ANALYSIS_TYPE, DatasetStatsAnalysis, DatasetStatsAnalysisProps } from './dataset-stats-analysis';
import { RASTER_POINT_INFO_TYPE, DatasetRasterPointInfo, DatasetRasterPointInfoProps } from './dataset-raster-point-info';

declare module './dataset-viz' {
    interface DatasetVizDefinitions {
        [RASTER_VIZ_TYPE]: RasterMapVizProps;
        [VERTICAL_PROFILE_VIZ_TYPE]: DatasetVerticalProfileVizProps;
        [VOLUMETRIC_VIZ_TYPE]: DatasetVolumetricVizProps;
        [DIMENSION_SERIES_TYPE]: DatasetDimensionSeriesProps;
        [TRANSECT_SERIES_TYPE]: DatasetTransectSeriesProps;
        [STATS_ANALYSIS_TYPE]: DatasetStatsAnalysisProps;
        [RASTER_POINT_INFO_TYPE]: DatasetRasterPointInfoProps;
    }

    interface DatasetVizTypes {
        [RASTER_VIZ_TYPE]: RasterMapViz;
        [VERTICAL_PROFILE_VIZ_TYPE]: DatasetVerticalProfileViz;
        [VOLUMETRIC_VIZ_TYPE]: DatasetVolumetricViz;
        [DIMENSION_SERIES_TYPE]: DatasetDimensionSeries;
        [TRANSECT_SERIES_TYPE]: DatasetTransectSeries;
        [STATS_ANALYSIS_TYPE]: DatasetStatsAnalysis;
        [RASTER_POINT_INFO_TYPE]: DatasetRasterPointInfo;
    }

}

DatasetViz.register(RASTER_VIZ_TYPE, RasterMapViz);
DatasetViz.register(VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz);
DatasetViz.register(VOLUMETRIC_VIZ_TYPE, DatasetVolumetricViz);

DatasetViz.register(DIMENSION_SERIES_TYPE, DatasetDimensionSeries);
DatasetViz.register(TRANSECT_SERIES_TYPE, DatasetTransectSeries);
DatasetViz.register(STATS_ANALYSIS_TYPE, DatasetStatsAnalysis);
DatasetViz.register(RASTER_POINT_INFO_TYPE, DatasetRasterPointInfo);


export * from './dataset-dimensions';
export * from './color-map';
export * from './vertical-scale';
export * from './shared-aoi';
export * from './dataset';
export * from './dataset-viz';
export * from './dataset-time-distribution-viz';
export * from './raster-band-mode';
export * from './raster-map-viz';
export * from './vertical-profile-viz';
export * from './volumetric-map-viz';
export * from './dataset-analysis';
export * from './combo-analysis';
export * from './dataset-analyses';
export * from './dataset-dimension-series';
export * from './dataset-transect-series';
export * from './dataset-stats-analysis';
export * from './dataset-raster-point-info';
export * from './map-rasters-point-info';
export * from './dataset-explorer';
export * from './dataset-discovery-provider';
export * from './dataset-discovery';
