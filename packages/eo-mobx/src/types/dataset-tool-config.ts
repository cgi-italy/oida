import { DatasetVizConfig, DatasetVizDefinition, DatasetVizDefinitions, DatasetVizProps } from '../models/dataset-viz';

export type DatasetToolConfig<TOOL_TYPE extends keyof DatasetVizDefinitions = keyof DatasetVizDefinitions> = {
    type: TOOL_TYPE,
    name: string,
    config: DatasetVizConfig<TOOL_TYPE>;
    hidden?: boolean;
    icon?: any
    defaultParams?: Omit<DatasetVizDefinition<TOOL_TYPE>, keyof DatasetVizProps>
};
