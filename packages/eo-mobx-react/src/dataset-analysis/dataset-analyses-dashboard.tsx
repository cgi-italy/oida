import React, { useEffect } from 'react';

import { DatasetExplorer, ComboAnalysis } from '@oida/eo-mobx';
import { LayoutSectionItem } from '@oida/ui-react-core';

import { DashboardPane, DashboardPaneProps } from './dashboard-pane';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';

import 'react-grid-layout/css/styles.css';
import { useSelector } from '@oida/ui-react-mobx';

/**
 * {@link DatasetAnalysesDashboard} component properties
 */
export type DatasetAnalysesDashboardProps = DashboardPaneProps & {
    /** the dataset explorer instance */
    datasetsExplorer: DatasetExplorer;
    /** the container visible height */
    containerHeight?: number;
    /** a map of analysis type / preferred layout */
    preferredLayout?: Record<string, {
        width: number;
        height: number;
        position?: 'tl' | 'tr' | 'bl' | 'br';
    }>
};

/**
 * A component that renders the {@link DatasetExplorer.analyses} into a {@link DashboardPane}
 * The analyses widgets are created thorough the {@link DatasetAnalysisWidgetFactory} using
 * the {@link DatasetAnalysis.type} as key for registered component retrieval
 * @param props the component properties
 */
export const DatasetAnalysesDashboard = (props: DatasetAnalysesDashboardProps) => {

    useEffect(() => {
        props.datasetsExplorer.analyses.setActive(true);
        return () => {
            props.datasetsExplorer.analyses.setActive(false);
        };
    }, []);

    let analysisComponents = useSelector(() => {

        const activeDatasets = props.datasetsExplorer.items.map(datasetView => datasetView.dataset);

        const comboAnalyses = Array.from(props.datasetsExplorer.analyses.analyses.values());

        let availableCombos = comboAnalyses.reduce((comboMap, analysis) => {
            return {
                ...comboMap,
                [analysis.type]: [
                    ...(comboMap[analysis.type] || []),
                    analysis
                ]
            };
        }, {} as Record<string, ComboAnalysis[]>);

        return comboAnalyses.filter(analysis => analysis.visible.value).map((analysis) => {

            const analysisType = analysis.type;
            if (DatasetAnalysisWidgetFactory.isRegistered(analysisType)) {

                const chartWidget = DatasetAnalysisWidgetFactory.create(analysisType, {
                    combinedAnalysis: analysis,
                    datasets: activeDatasets,
                    availableCombos: availableCombos
                });

                return {
                    id: analysis.id,
                    title: `${analysis.name}`,
                    content: chartWidget,
                    preferredLayout: props.preferredLayout ? props.preferredLayout[analysisType] : undefined,
                    onClose: () => {
                        if (analysis.destroyOnClose) {
                            props.datasetsExplorer.analyses.removeComboAnalysis(analysis);
                        } else {
                            analysis.visible.setValue(false);
                        }
                    }
                };
            }
        });
    });

    let vizComponents = useSelector(() => {
        const mapViews = props.datasetsExplorer.items
        .filter(datasetView => {
            return datasetView.mapViz?.mapLayer?.visible.value && datasetView.mapViz.widgetVisible;
        }).map(datasetView => datasetView.mapViz);
        return mapViews.map((mapViz) => {
            if (mapViz && DatasetAnalysisWidgetFactory.isRegistered(mapViz.vizType)) {
                let vizWidget = DatasetAnalysisWidgetFactory.create(mapViz.vizType, {
                    mapViz: mapViz
                });

                return {
                    id: mapViz.id,
                    title: `${mapViz.dataset.config.name}`,
                    content: vizWidget,
                    onClose: () => {
                        mapViz.setWidgetVisible(false);
                    }
                };
            }
        });
    });


    return (
        <DashboardPane
            numCols={props.numCols}
            rowSnapHeight={props.rowSnapHeight}
            compactType={props.compactType}
            preventCollision={props.preventCollision}
            defaultWidgetPosition={props.defaultWidgetPosition}
            containerHeight={props.containerHeight}
            setExpanded={() => {}}
            expanded={true}
            showComponent={() => {}}
            style={props.style}
            components={[...vizComponents, ...analysisComponents].filter((component) => component !== undefined) as LayoutSectionItem[]}
        />
    );
};
