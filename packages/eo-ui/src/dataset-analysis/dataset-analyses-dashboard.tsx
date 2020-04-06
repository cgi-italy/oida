import React, { useEffect } from 'react';
import { useObserver } from 'mobx-react';

import { IDatasetAnalyses, IDataset } from '@oida/eo';

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
    analyses: IDatasetAnalyses
};


export const DatasetAnalysesDashboard = (props: DatasetAnalysesDashboardProps) => {

    useEffect(() => {
        props.analyses.setActive(true);
        return () => {
            props.analyses.setActive(false);
        };
    }, []);

    let components = useObserver(
        () => props.analyses.collection.items.filter(analysis => analysis.visible).map((analysis) => {

            let analysisType = analysis.datasetViz.datasetVizType;
            if (DatasetAnalysisWidgetFactory.isRegistered(analysisType)) {

                let chartWidget = DatasetAnalysisWidgetFactory.create(analysisType, {
                    analysis: analysis
                });
                return {
                    id: analysis.id,
                    title: `${analysis.datasetViz.dataset.config.name}: ${analysis.datasetViz.name || ''}`,
                    content: chartWidget
                };
            }
        }
    ));

    const onWidgetClose = (widgetId: string) => {
        let analysis = props.analyses.collection.itemWithId(widgetId);
        if (analysis) {
            if (analysis.destroyOnClose) {
                props.analyses.collection.remove(analysis);
            } else {
                analysis.setVisible(false);
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
            // @ts-ignore
            components={components.filter((component) => component !== undefined)}
            onWidgetClose={onWidgetClose}
        />
    );
};
