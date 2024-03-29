import React, { useEffect } from 'react';

import { DatasetExplorer, DatasetAnalysis } from '@oidajs/eo-mobx';
import { LayoutSectionItem } from '@oidajs/ui-react-core';

import { DashboardPane, DashboardPaneProps } from './dashboard-pane';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';

import 'react-grid-layout/css/styles.css';
import { useSelector } from '@oidajs/ui-react-mobx';

/**
 * {@link DatasetAnalysesDashboard} component properties
 */
export type DatasetAnalysesDashboardProps = DashboardPaneProps & {
    /** the dataset explorer instance */
    datasetsExplorer: DatasetExplorer;
    /** the container visible height */
    containerHeight?: number;
    /** a map of analysis type / preferred layout */
    preferredLayout?: Record<
        string,
        {
            width: number;
            height: number;
            position?: 'tl' | 'tr' | 'bl' | 'br';
        }
    >;
    /** disable analysis widget titles edit */
    disableRenaming?: boolean;
};

/**
 * A component that renders the {@link DatasetExplorer.analyses} into a {@link DashboardPane}
 * The analyses widgets are created thorough the {@link DatasetAnalysisWidgetFactory} using
 * the {@link DatasetAnalysis.type} as key for registered component retrieval
 * @param props the component properties
 */
export const DatasetAnalysesDashboard = (props: DatasetAnalysesDashboardProps) => {
    useEffect(() => {
        props.datasetsExplorer.analytics.setActive(true);
        return () => {
            props.datasetsExplorer.analytics.setActive(false);
        };
    }, []);

    const analysisComponents = useSelector(() => {
        const comboAnalyses = Array.from(props.datasetsExplorer.analytics.analyses.values());

        const availableCombos = comboAnalyses.reduce((comboMap, analysis) => {
            return {
                ...comboMap,
                [analysis.type]: [...(comboMap[analysis.type] || []), analysis]
            };
        }, {} as Record<string, DatasetAnalysis[]>);

        return comboAnalyses
            .filter((analysis) => analysis.visible.value)
            .map((analysis) => {
                const analysisType = analysis.type;
                if (DatasetAnalysisWidgetFactory.isRegistered(analysisType)) {
                    const chartWidget = DatasetAnalysisWidgetFactory.create(analysisType, {
                        combinedAnalysis: analysis,
                        datasetExplorerItems: props.datasetsExplorer.items,
                        availableCombos: availableCombos
                    });

                    return {
                        id: analysis.id,
                        title: `${analysis.name}`,
                        content: chartWidget,
                        preferredLayout: props.preferredLayout ? props.preferredLayout[analysisType] : undefined,
                        onClose: () => {
                            if (analysis.destroyOnClose) {
                                props.datasetsExplorer.analytics.removeAnalysis(analysis);
                            } else {
                                analysis.visible.setValue(false);
                            }
                        },
                        onRename: !props.disableRenaming
                            ? (name) => {
                                  analysis.setName(name);
                              }
                            : undefined
                    };
                }
            });
    });

    const vizComponents = useSelector(() => {
        const mapViews = props.datasetsExplorer.items
            .filter((datasetView) => {
                return datasetView.mapViz?.mapLayer?.visible.value && datasetView.mapViz.widgetVisible;
            })
            .map((datasetView) => datasetView.mapViz);
        return mapViews.map((mapViz) => {
            if (mapViz && DatasetAnalysisWidgetFactory.isRegistered(mapViz.vizType)) {
                const vizWidget = DatasetAnalysisWidgetFactory.create(mapViz.vizType, {
                    mapViz: mapViz
                });

                return {
                    id: mapViz.id,
                    title: `${mapViz.widgetName}`,
                    content: vizWidget,
                    preferredLayout: props.preferredLayout ? props.preferredLayout[mapViz.vizType] : undefined,
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
            setExpanded={() => {
                // do nothing
            }}
            expanded={true}
            showComponent={() => {
                // do nothing
            }}
            style={props.style}
            components={[...vizComponents, ...analysisComponents].filter((component) => component !== undefined) as LayoutSectionItem[]}
        />
    );
};
