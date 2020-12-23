import { DatasetViz } from '../models/dataset-viz';

export type DatasetSpatialCoverageProvider = (datasetViz: DatasetViz<any>) => Promise<number[] | undefined>;
