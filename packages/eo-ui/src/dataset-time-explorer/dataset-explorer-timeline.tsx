import React, { useRef, useState, useEffect } from 'react';

import { DataSet, TimelineGroup, TimelineItem } from 'vis-timeline';

import { autorun } from 'mobx';

import { Button, Icon, Tooltip } from 'antd';

import { ArrayTracker } from '@oida/state-mst';
import { IDatasetsExplorer } from '@oida/eo';

import { Timeline } from './timeline';

export type DatasetDiscoveryTimelineToolbar = {
    explorerState: IDatasetsExplorer;
    actions: any[];
    activeAction: string;
};

export const DatasetExplorerTimelineToolbar = (props) => {

    let buttons = props.actions.map((action) => {
        return (
            <Tooltip
                title={action.title}
                key={action.id}
            >
                <Button
                    onClick={action.callback}
                    disabled={action.disabled}
                    size='small'
                    type='link'
                >{action.icon}</Button>
            </Tooltip>
        );
    });

    return (
        <Button.Group>
            {buttons}
        </Button.Group>
    );
};

export type DatasetExplorerTimelineProps = {
    explorerState: IDatasetsExplorer;
};

export const DatasetDiscoveryTimeline = (props: DatasetExplorerTimelineProps) => {

    let timelineGroups = useRef(new DataSet<TimelineGroup>());
    let timelineItems = useRef(new DataSet<TimelineItem>());

    let [visibleRange, setVisibleRange] = useState(props.explorerState.timeExplorer.visibleRange.range);
    let [editableRanges, setEditableRanges] = useState<any>([]);
    let [activeToolbarAction, setActiveToolbarAction] = useState<string>();

    const updateGroupsOrdering = () => {
        props.explorerState.datasetViews.forEach((datasetView, idx) => {
            timelineGroups.current.update({
                id: datasetView.dataset.id,
                zIndex: idx
            });
        });
    };

    useEffect(() => {

        let groupTracker = new ArrayTracker({
            items: props.explorerState.datasetViews,
            idGetter: (datasetView) => datasetView.dataset.id,
            onItemAdd: (datasetView, idx) => {

                let groupId = datasetView.dataset.id;
                let groupUpdateDisposer = autorun(() => {
                    timelineGroups.current.update({
                        id: groupId,
                        className: datasetView.dataset.id,
                        datasetView: datasetView,
                        visible: true,
                        zIndex: idx
                    });
                });


                let groupItemsTracker = new ArrayTracker({
                    items: datasetView.timeDistributionViz!.timeDistribution.items,
                    idGetter: (item) => `${datasetView.dataset.id}_${new Date(item.start).toISOString()}`,
                    onItemAdd: (item, idx) => {

                        let itemId = `${datasetView.dataset.id}_${item.isoString()}`;

                        let itemUpdateDisposer = autorun(() => {
                            timelineItems.current.update({
                                id: itemId,
                                className: item.data && item.data.loading ? 'is-loading' : '',
                                group: datasetView.dataset.id,
                                start: item.start,
                                end: item.end,
                                style: `background-color: ${datasetView.dataset.config.color}; border: none`
                            });
                        });

                        return () => {
                            timelineItems.current.remove(itemId);
                            itemUpdateDisposer();
                        };
                    },
                    onItemRemove: (disposer) => {
                        //@ts-ignore
                        disposer();
                    }
                });

                updateGroupsOrdering();

                return (() => {
                    groupUpdateDisposer();
                    groupItemsTracker.destroy();
                    timelineGroups.current.remove(groupId);
                });

            },
            onItemRemove: (disposer) => {
                //@ts-ignore
                disposer();
                updateGroupsOrdering();
            }
        });

        let queryRangeTrackerDisposer = autorun(() => {
            let queryRange = props.explorerState.toi;

            if (queryRange) {
                setEditableRanges([{
                    id: 'query',
                    start: queryRange.start,
                    end: queryRange.end,
                    onRangeUpdate: (range) => {
                        props.explorerState.setToi(range);
                    }
                }]);
            } else {
                setEditableRanges([]);
            }
        });

        let visibleRangeTrackerDisposer = autorun(() => {
            setVisibleRange(props.explorerState.timeExplorer!.visibleRange.range);
        });

        return (() => {
            groupTracker.destroy();
            queryRangeTrackerDisposer();
            visibleRangeTrackerDisposer();
        });

    }, []);


    let toolbarActions = [{
        id: 'drawQueryRange',
        icon: <Icon type='column-width' />,
        title: 'Draw query time range',
        callback: () => {
            enableAction('drawQueryRange', () => {
                setEditableRanges([{
                    id: 'query',
                    enableDraw: true,
                    onRangeUpdate: (range) => {
                        props.explorerState.setToi(range);
                        setActiveToolbarAction(undefined);
                    }
                }]);
            });
        },
        onCancel: () => {
            let queryRange = props.explorerState.toi;
            if (queryRange) {
                setEditableRanges([{
                    id: 'query',
                    start: queryRange.start,
                    end: queryRange.end,
                    onRangeUpdate: (range) => {
                        props.explorerState.setToi(range);
                    }
                }]);
            } else {
                setEditableRanges([]);
            }
        }
    }, {
        id: 'zoomToQueryRange',
        icon: <Icon type='clock-circle' />,
        title: 'Zoom to query time range',
        disabled: !props.explorerState.toi,
        callback: () => {
            let queryRange = props.explorerState.toi;
            props.explorerState.timeExplorer.visibleRange.makeRangeVisible(
                queryRange.start, queryRange.end, 0.2, true
            );
        }
    }];

    const cancelCurrentAction = () => {
        if (activeToolbarAction) {
            let currentAction = toolbarActions.find((action) => action.id === activeToolbarAction);
            setActiveToolbarAction(undefined);
            if (currentAction && currentAction.onCancel) {
                currentAction.onCancel();
            }
        }
    };

    const enableAction = (id, callback) => {
        if (activeToolbarAction !== id) {
            cancelCurrentAction();
            setActiveToolbarAction(id);
            callback();
        } else {
            cancelCurrentAction();
        }
    };

    return (
        <div className='dataset-explorer-timeline'>
            <DatasetExplorerTimelineToolbar
                discoveryState={props.explorerState}
                actions={toolbarActions}
            />
            <Timeline
                range={visibleRange}
                timelineGroups={timelineGroups.current}
                timelineItems={timelineItems.current}
                editableRanges={editableRanges}
                onRangeChange={(range) => {
                    props.explorerState.timeExplorer.visibleRange.setRange(range.start!, range.end!);
                }}
                onSelectedChange={(item) => {

                }}
                onHoveredChange={(item) => {

                }}
            />
        </div>
    );
};
