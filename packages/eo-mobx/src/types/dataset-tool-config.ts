import { DatasetVizConfig, DatasetVizDefinitions } from '../models/dataset-viz';

export type DatasetToolConfig<TOOL_TYPE extends keyof DatasetVizDefinitions = keyof DatasetVizDefinitions> = {
    type: TOOL_TYPE,
    name: string,
    config: DatasetVizConfig<TOOL_TYPE>;
    icon?: any
};
