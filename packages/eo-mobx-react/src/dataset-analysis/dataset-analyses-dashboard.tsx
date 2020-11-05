import React, { useEffect } from 'react';

import { DatasetExplorer, Dataset, ComboAnalysis } from '@oida/eo-mobx';
import { LayoutSectionItem } from '@oida/ui-react-core';

import { DashboardPane, DashboardGridBreakpoint } from './dashboard-pane';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';

import 'react-grid-layout/css/styles.css';
import { useSelector } from '@oida/ui-react-mobx';


export type DatasetAnalysisToolbarProps = {
    datasets: Dataset[]
};

export const DatasetAnalysisToolbar = (props: DatasetAnalysisToolbarProps) => {
    props.datasets.forEach((dataset) => {
        if (dataset.config.tools) {
            dataset.config.tools.forEach((tool) => {

            });
        }
    });
};

export type DatasetAnalysesDashboardProps = {
    gridBreakpoints: DashboardGridBreakpoint[],
    rowSnapHeight?: number;
    style?: React.CSSProperties;
    datasetsExplorer: DatasetExplorer
};


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

        return comboAnalyses.filter(analysis => analysis.visible).map((analysis) => {

            let analysisType = analysis.type;
            if (DatasetAnalysisWidgetFactory.isRegistered(analysisType)) {

                let chartWidget = DatasetAnalysisWidgetFactory.create(analysisType, {
                    combinedAnalysis: analysis,
                    datasets: activeDatasets,
                    availableCombos: availableCombos
                });

                return {
                    id: analysis.id,
                    title: `${analysis.name}`,
                    content: chartWidget,
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
            gridBreakpoints={props.gridBreakpoints}
            rowSnapHeight={props.rowSnapHeight}
            setExpanded={() => {}}
            expanded={true}
            showComponent={() => {}}
            style={props.style}
            components={[...vizComponents, ...analysisComponents].filter((component) => component !== undefined) as LayoutSectionItem[]}
        />
    );
};
