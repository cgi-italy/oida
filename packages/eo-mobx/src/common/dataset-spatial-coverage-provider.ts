import { DatasetViz } from './dataset-viz';

export type DatasetSpatialCoverageProvider = (datasetViz: DatasetViz<string, any>) => Promise<number[] | undefined>;
