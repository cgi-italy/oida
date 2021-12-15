import { DatasetSpatialCoverageProvider, DatasetViz } from '@oidajs/eo-mobx';

import { DatasetVideoMapViz } from './daraset-video-map-viz';

export const VideoSpatialCoverageProvider: DatasetSpatialCoverageProvider = (video: DatasetViz<any>) => {
    return Promise.resolve((video as DatasetVideoMapViz).source.extent);
};
