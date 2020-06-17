import React, { useEffect } from 'react';
import { useObserver } from 'mobx-react';

import { IDatasetsExplorer, IDataset } from '@oida/eo';
import { LayoutSectionItem } from '@oida/ui-react-core';

import { DashboardPane, DashboardGridBreakpoint } from './dashboard-pane';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';

import 'react-grid-layout/css/styles.css';


export type DatasetAnalysisToolbarProps = {
    datasets: IDataset[]
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
    style: React.CSSProperties;
    datasetsExplorer: IDatasetsExplorer
};


export const DatasetAnalysesDashboard = (props: DatasetAnalysesDashboardProps) => {

    useEffect(() => {
        props.datasetsExplorer.analyses.setActive(true);
        return () => {
            props.datasetsExplorer.analyses.setActive(false);
        };
    }, []);

    let activeDatasets = useObserver(() => {
        return props.datasetsExplorer.datasetViews.map(datasetView => datasetView.dataset.config);
    });

    let components = useObserver(
        () => Array.from(props.datasetsExplorer.analyses.comboAnalyses.values()).filter(analysis => analysis.visible).map((analysis) => {

            let analysisType = analysis.type;
            if (DatasetAnalysisWidgetFactory.isRegistered(analysisType)) {

                let chartWidget = DatasetAnalysisWidgetFactory.create(analysisType, {
                    combinedAnalysis: analysis,
                    datasets: activeDatasets
                });
                return {
                    id: analysis.id,
                    title: `${analysis.name}`,
                    content: chartWidget
                };
            }
        }
    ));

    const onWidgetClose = (widgetId: string) => {
        let comboAnalysis = props.datasetsExplorer.analyses.comboAnalyses.get(widgetId);
        if (comboAnalysis) {
            if (comboAnalysis.destroyOnClose) {
                props.datasetsExplorer.analyses.removeComboAnalysis(comboAnalysis.id);
            } else {
                comboAnalysis.setVisible(false);
            }
        }
    };

    return (
        <DashboardPane
            gridBreakpoints={props.gridBreakpoints}
            rowSnapHeight={props.rowSnapHeight}
            setExpanded={() => {}}
            expanded={true}
            showComponent={() => {}}
            style={props.style}
            components={components.filter((component) => component !== undefined) as LayoutSectionItem[]}
            onWidgetClose={onWidgetClose}
        />
    );
};
