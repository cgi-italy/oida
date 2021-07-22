import {
    ComboAnalysis, ComboAnalysisProps, DatasetAnalysis,
    DatasetExplorer, DatasetExplorerItem, DatasetViz, generateComboAnalysisName } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

/** A combo analysis tool configuration */
export type ComboToolConfig = {
    /** The tool type */
    type: string;
    /** The tool name */
    name: string;
    /** The tool type that a dataset should support to be listed as a potential input of this analyis */
    datasetRequiredTool: string;
    /** The factory function that will create the combo analysis instance */
    analysisFactory: (props: ComboAnalysisProps & {
        targets:  Array<{
            explorerItem: DatasetExplorerItem;
            config: any
        }>
    }) => ComboAnalysis;
    /** An optional icon */
    icon?: React.ReactNode;
};

/** The item type of the array returned by the {@link useDatasetExplorerTools} hook */
export type DatasetExplorerTool = {
    /** The tool id*/
    id: string;
    /** The tool name */
    name: string;
    /** The tool icon */
    icon: React.ReactNode;
    /** The callback that should be called when the tool is selected */
    callback: () => void;
};

export type DatasetExplorerToolsProps = {
    datasetExplorer: DatasetExplorer;
    combinedAnalysisTools?: ComboToolConfig[];
};

/**
 * A react hook that returns the list of tools for the datasets currently added to a {@link DatasetExplorer} instance
 * @param props
 * @returns A list of tools configuration to be used as menu items or toolbar buttons
 */
export const useDatasetExplorerTools = (props: DatasetExplorerToolsProps) => {

    const availableTools = useSelector(() => {

        const tools: Record<string, {
            targets: Array<{
                explorerItem: DatasetExplorerItem;
                config: any,
                defaultParams: any
            }>
            name: string;
            hidden?: boolean;
            icon?: React.ReactNode;
        }> = {};

        props.datasetExplorer.items.forEach((item) => {
            item.dataset.config.tools?.forEach((tool) => {
                if (tools[tool.type]) {
                    tools[tool.type].targets.push({
                        explorerItem: item,
                        config: tool.config,
                        defaultParams: tool.defaultParams
                    });
                } else {
                    tools[tool.type] = {
                        targets: [{
                            explorerItem: item,
                            config: tool.config,
                            defaultParams: tool.defaultParams
                        }],
                        name: tool.name,
                        icon: tool.icon,
                        hidden: tool.hidden
                    };
                }
            });
        });

        return tools;
    });

    const tools: DatasetExplorerTool[] = Object.entries(availableTools).filter(([type, tool]) => {
        return !tool.hidden;
    }).map(([type, tool]) => {
        return {
            id: type,
            name: tool.name,
            icon: tool.icon,
            callback: () => {
                const defaultTarget = tool.targets[0];
                const analysis = DatasetViz.create<any>({
                    vizType: type,
                    dataset: defaultTarget.explorerItem.dataset,
                    parent: defaultTarget.explorerItem.mapViz,
                    config: defaultTarget.config,
                    ...defaultTarget.defaultParams
                });
                if (analysis instanceof DatasetAnalysis) {
                    props.datasetExplorer.analyses.addAnalysis(analysis, new ComboAnalysis({
                        name: generateComboAnalysisName(tool.name),
                        type: type,
                        parent: props.datasetExplorer.analyses
                    }));
                }
            }
        };
    }).concat((props.combinedAnalysisTools || []).filter((tool) => {
        return !!availableTools[tool.datasetRequiredTool];
    }).map((tool) => {

        const targets = availableTools[tool.datasetRequiredTool].targets;
        return {
            id: tool.type,
            name: tool.name,
            icon: tool.icon,
            callback: () => {
                const comboAnalysis = tool.analysisFactory({
                    name: generateComboAnalysisName(tool.name),
                    parent: props.datasetExplorer.analyses,
                    type: tool.type,
                    targets: targets
                });
                props.datasetExplorer.analyses.addComboAnalysis(comboAnalysis);
            }
        };
    }));

    return tools;
};
