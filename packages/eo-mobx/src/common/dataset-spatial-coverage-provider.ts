import { DatasetViz } from './dataset-viz';

export type DatasetSpatialCoverageProvider = (datasetViz: DatasetViz<any>) => Promise<number[] | undefined>;
