import { DatasetViz } from '../common';

import { RASTER_VIZ_TYPE, RasterMapViz, RasterMapVizProps } from './raster-map-viz';
import { VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz, DatasetVerticalProfileVizProps } from './vertical-profile-viz';
import { VOLUMETRIC_VIZ_TYPE, DatasetVolumetricViz, DatasetVolumetricVizProps } from './volumetric-map-viz';

declare module '../common/dataset-viz' {
    interface DatasetVizDefinitions {
        [RASTER_VIZ_TYPE]: RasterMapVizProps;
        [VERTICAL_PROFILE_VIZ_TYPE]: DatasetVerticalProfileVizProps;
        [VOLUMETRIC_VIZ_TYPE]: DatasetVolumetricVizProps;
    }

    interface DatasetVizTypes {
        [RASTER_VIZ_TYPE]: RasterMapViz;
        [VERTICAL_PROFILE_VIZ_TYPE]: DatasetVerticalProfileViz;
        [VOLUMETRIC_VIZ_TYPE]: DatasetVolumetricViz;
    }

}

DatasetViz.register(RASTER_VIZ_TYPE, RasterMapViz);
DatasetViz.register(VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz);
DatasetViz.register(VOLUMETRIC_VIZ_TYPE, DatasetVolumetricViz);

export * from './raster-band-mode';
export * from './raster-map-viz';
export * from './vertical-profile-viz';
export * from './volumetric-map-viz';
export * from './vertical-scale';
