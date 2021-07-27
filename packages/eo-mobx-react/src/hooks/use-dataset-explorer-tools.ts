import {
    DatasetAnalysis, DatasetAnalysisProps, DatasetProcessing,
    DatasetExplorer, DatasetExplorerItem, DatasetViz, generateAnalysisName, Dataset } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

/** A combo analysis tool configuration */
export type ComboToolConfig = {
    /** The tool type */
    type: string;
    /** The tool name */
    name: string;
    /** The factory function that will create the combo analysis instance */
    analysisFactory: (dataset?: Dataset) => DatasetAnalysis;
    condition?: (dataset: Dataset) => boolean;
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
    combinedAnalysisTools: ComboToolConfig[];
    dataset?: Dataset
};

/**
 * A react hook that returns the list of tools for the datasets currently added to a {@link DatasetExplorer} instance
 * @param props
 * @returns A list of tools configuration to be used as menu items or toolbar buttons
 */
export const useDatasetExplorerTools = (props: DatasetExplorerToolsProps) => {

    const explorerItems = useSelector(() => props.datasetExplorer.items.slice());

    const tools: DatasetExplorerTool[] = props.combinedAnalysisTools.filter((tool) => {
        if (!tool.condition) {
            return true;
        } else {
            if (props.dataset) {
                return tool.condition(props.dataset);
            } else {
                // check that there is at least one explorer item supporting the analysis
                return explorerItems.some((item) => {
                    return tool.condition!(item.dataset);
                });
            }
        }
    }).map((tool) => {
        return {
            id: tool.type,
            icon: tool.icon,
            name: tool.name,
            callback: () => {
                const analysis = tool.analysisFactory(props.dataset);
                props.datasetExplorer.analytics.addAnalysis(analysis);
            }
        };
    });

    return tools;

};
