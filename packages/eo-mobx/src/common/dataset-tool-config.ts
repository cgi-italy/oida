import { DatasetVizConfig, DatasetVizDefinition, DatasetVizProps } from './dataset-viz';

export type DatasetToolConfig<TOOL_TYPE extends string = string> = {
    type: TOOL_TYPE;
    name: string;
    config: DatasetVizConfig<TOOL_TYPE>;
    hidden?: boolean;
    icon?: any;
    defaultParams?: Omit<DatasetVizDefinition<TOOL_TYPE>, keyof DatasetVizProps>;
};
