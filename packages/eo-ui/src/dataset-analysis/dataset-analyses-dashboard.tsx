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

    let components = useObserver(() => props.analyses.collection.items.map((analysis) => {
        if (DatasetAnalysisWidgetFactory.isRegistered(analysis.analysisType)) {

            let toolConfig = analysis.dataset.config!.tools!.find(tool => {
                return tool.type === analysis.analysisType;
            });

            let chartWidget = DatasetAnalysisWidgetFactory.create(analysis.analysisType, {
                analysis: analysis
            });
            return {
                id: analysis.id,
                title: `${analysis.dataset.config!.name}: ${toolConfig ? toolConfig.name : ''}`,
                content: chartWidget
            };
        }
    }));


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
            onWidgetClose={(id: string) => props.analyses.collection.removeItemWithId(id)}
        />
    );
};
