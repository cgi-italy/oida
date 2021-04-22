import { DatasetViz } from '@oida/eo-mobx';
import { VIDEO_VIZ_TYPE, DatasetVideoMapViz, DatasetVideoMapVizProps } from './daraset-video-map-viz';

declare module '@oida/eo-mobx' {
    interface DatasetVizDefinitions {
        [VIDEO_VIZ_TYPE]: DatasetVideoMapVizProps;
    }

    interface DatasetVizTypes {
        [VIDEO_VIZ_TYPE]: DatasetVideoMapViz;
    }
}

DatasetViz.register(VIDEO_VIZ_TYPE, DatasetVideoMapViz);

export * from './adaptive-video';
export * from './adaptive-video-source';
export * from './daraset-video-map-viz';
export * from './video-time-distribution-provider';
export * from './video-spatial-coverage-provider';
export * from './video-adapters';
