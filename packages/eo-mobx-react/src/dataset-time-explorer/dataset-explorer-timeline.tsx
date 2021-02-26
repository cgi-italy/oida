import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { autorun } from 'mobx';
import classnames from 'classnames';
import { TimelineGroup, TimelineItem, TimelineEventPropertiesResult } from 'vis-timeline/peer';
import { DataSet } from 'vis-data/peer';
import moment from 'moment';

import { Button, Tooltip } from 'antd';
import { ColumnWidthOutlined, ClockCircleOutlined, SearchOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import { DateRangeValue } from '@oida/core';
import { ArrayTracker } from '@oida/state-mobx';
import { DateFieldRenderer, DateRangeFieldRenderer } from '@oida/ui-react-antd';
import { useSelector } from '@oida/ui-react-mobx';
import { DatasetExplorer, DatasetExplorerItem, TimeSearchDirection, getNearestDatasetProduct } from '@oida/eo-mobx';

import { Timeline, TimelineGroupLabelsMode } from './timeline';


export enum DatasetTimelineTimeSelectionMode {
    Instant = 'instant',
    Range = 'range'
}

export type DatasetDiscoveryTimelineToolbarProps = {
    onDrawRange: () => void;
    timeSelectionMode: DatasetTimelineTimeSelectionMode;
    onTimeSelectionModeChange: (selectionMode: DatasetTimelineTimeSelectionMode) => void;
    groupLabelsMode: TimelineGroupLabelsMode
    onGroupLabelsModeChange: (mode: TimelineGroupLabelsMode) => void;
    selectedTime: Date | DateRangeValue | undefined
    onSelectedTimeChange: (value: Date | DateRangeValue | undefined) => void;
    onGoToTimeSelection: () => void;
};

export const DatasetExplorerTimelineToolbar = (props: DatasetDiscoveryTimelineToolbarProps) => {

    const layerNamesVisible = props.groupLabelsMode === TimelineGroupLabelsMode.Block;
    const isRangeMode = props.timeSelectionMode === DatasetTimelineTimeSelectionMode.Range;

    let timeField: JSX.Element;

    if (!isRangeMode) {
        timeField = (
            <DateFieldRenderer
                config={{
                    withTime: true
                }}
                rendererConfig={{
                    props: {
                        size: 'small',
                        bordered: false,
                        suffixIcon: null
                    }
                }}
                required={true}
                value={props.selectedTime as Date}
                onChange={props.onSelectedTimeChange}
            />
        );

    } else {

        timeField = (
            <DateRangeFieldRenderer
                config={{
                    withTime: true
                }}
                rendererConfig={{
                    props: {
                        size: 'small',
                        bordered: false,
                        suffixIcon: null
                    }
                }}
                required={false}
                value={props.selectedTime as DateRangeValue}
                onChange={props.onSelectedTimeChange}
            />
        );

    }


    return (
        <div className='dataset-timeline-toolbar'>
            <Tooltip
                title={layerNamesVisible ? 'Hide layer names' : 'Show layer names'}
            >
                <Button
                    type={layerNamesVisible ? 'link' : 'link'}
                    size='small'
                    onClick={() => {
                        props.onGroupLabelsModeChange(layerNamesVisible ? TimelineGroupLabelsMode.Hidden : TimelineGroupLabelsMode.Block);
                    }}
                >
                    {layerNamesVisible ? <MenuFoldOutlined/> : <MenuUnfoldOutlined/>}
                </Button>
            </Tooltip>
            <Tooltip
                title='Go to selected time'
            >
                <Button
                    type='link'
                    size='small'
                    onClick={props.onGoToTimeSelection}
                >
                    <ClockCircleOutlined/>
                </Button>
            </Tooltip>
            <Tooltip
                title={isRangeMode ? 'Disable range mode' : 'Enable range mode' }
            >
                <Button
                    type={isRangeMode ? 'primary' : 'link'}
                    size='small'
                    onClick={() => {
                        props.onTimeSelectionModeChange(isRangeMode
                            ? DatasetTimelineTimeSelectionMode.Instant
                            : DatasetTimelineTimeSelectionMode.Range
                        );
                    }}
                >
                    <ColumnWidthOutlined/>
                </Button>
            </Tooltip>
            {timeField}
        </div>
    );
};

export type DatasetExplorerTimelineProps = {
    explorerState: DatasetExplorer;
};

export type DatasetDiscoveryTimelineGroup = TimelineGroup & {
    datasetView: DatasetExplorerItem,
    element?: Element,
    zIndex: number
};

export type DatasetTimelineGroupTemplateProps = {
    explorerState: DatasetExplorer;
    datasetView?: DatasetExplorerItem;
};

export const DatasetTimelineGroupTemplate = (props: DatasetTimelineGroupTemplateProps) => {

    const datasetView = props.datasetView;
    if (!datasetView) {
        return null;
    }

    let centerTimeExtentButton;

    const timeProvider = datasetView.dataset.config.timeDistribution?.provider;
    if (timeProvider) {

        centerTimeExtentButton = (
            <Tooltip
                title='Zoom to dataset time extent'
            >
                <Button
                    size='small'
                    type='link'
                    onClick={() => {
                        timeProvider.getTimeExtent(Array.from(datasetView.dataset.filters.items.values())).then((range) => {
                            if (range) {
                                props.explorerState.timeExplorer?.visibleRange.centerRange(
                                    new Date(range.start), new Date(range.end), {
                                        margin: 0.1,
                                        animate: true
                                    }
                                );
                            }
                        });
                    }}
                >
                    <SearchOutlined />
                </Button>
            </Tooltip>
        );

    }
    return <div className='dataset-timeline-group-label'>
        <div className='dataset-timeline-group-name'>{datasetView.dataset.config.name}</div>
        <div className='dataset-timeline-group-actions'>{centerTimeExtentButton}</div>
    </div>;
};

export type TimelineGroupTemplatesProps = {
    groups: DataSet<DatasetDiscoveryTimelineGroup>
    explorerState: DatasetExplorer
};
export const TimelineGroupTemplates = (props: TimelineGroupTemplatesProps) => {

    const [groupTemplates, setGroupTemplates] = useState<React.ReactPortal[]>([]);

    useEffect(() => {
        const groups = props.groups;
        const onGroupsUpdate = () => {
            const groupTemplates = groups.map(group => {
                if (group.element) {
                    return ReactDOM.createPortal(
                        <DatasetTimelineGroupTemplate
                            key={group.id}
                            datasetView={group.datasetView}
                            explorerState={props.explorerState}
                        />,
                        group.element
                    );
                }
            });
            setGroupTemplates(groupTemplates.filter(portal => !!portal) as React.ReactPortal[]);
        };

        groups.on('*', onGroupsUpdate);

        return () => {
            groups.off('*', onGroupsUpdate);
        };
    }, [props.groups]);

    return <React.Fragment>
        {groupTemplates}
    </React.Fragment>;
};

export const DatasetDiscoveryTimeline = (props: DatasetExplorerTimelineProps) => {

    const timeExplorer = props.explorerState.timeExplorer;

    let runningRequest: Promise<any> | undefined;
    const onSelectedDateChange = (date: Date) => {
        if (runningRequest && runningRequest.cancel) {
            runningRequest.cancel();
        }
        let searchDirection = (selectedDate && date > selectedDate) ? TimeSearchDirection.Forward : TimeSearchDirection.Backward;
        runningRequest = getNearestDatasetProduct(date, searchDirection, props.explorerState.items).then(nearestItem => {
            runningRequest = undefined;
            if (nearestItem) {
                props.explorerState.setSelectedDate(nearestItem);
                if (timeExplorer) {
                    setVisibleRange({
                        ...timeExplorer.visibleRange.range
                    });
                }
            } else {
                props.explorerState.setSelectedDate(date);
            }
        });
    };

    const goToTimeSelection = () => {
        if (timeExplorer) {
            if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Instant && props.explorerState.selectedDate) {
                timeExplorer.visibleRange.centerDate(props.explorerState.selectedDate, {
                    animate: true
                });
            } else if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Range && props.explorerState.toi) {
                let queryRange = props.explorerState.toi;
                if (queryRange) {
                    timeExplorer.visibleRange.centerRange(
                        queryRange.start,
                        queryRange.end,
                        {
                            margin: 0.2,
                            animate: true
                        }
                    );
                }
            }
        }
    };

    const updateGroupsOrdering = () => {
        props.explorerState.items.forEach((datasetView, idx) => {
            if (timelineGroups.current.get(datasetView.dataset.id)) {
                timelineGroups.current.update({
                    id: datasetView.dataset.id,
                    zIndex: idx
                });
            }
        });
    };

    const timelineGroups = useRef(new DataSet<DatasetDiscoveryTimelineGroup>());
    const timelineItems = useRef(new DataSet<TimelineItem>());

    const [visibleRange, setVisibleRange] = useState(timeExplorer ? timeExplorer.visibleRange.range : {
        start: moment.utc().subtract(1, 'month').toDate(),
        end: moment.utc().toDate()
    });
    const [editableRanges, setEditableRanges] = useState<any>([]);
    const [groupLabelsMode, setGroupLabelsMode] = useState(TimelineGroupLabelsMode.Block);
    const [timeSelectionMode, setTimeSelectionMode] = useState(DatasetTimelineTimeSelectionMode.Instant);

    const selectedDate = useSelector(() => props.explorerState.selectedDate);

    const onTimelineClick = useCallback((evt: TimelineEventPropertiesResult) => {
        if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Instant) {
            if (evt.what === 'item' && evt.item) {
                let item = timelineItems.current.get(evt.item);
                if (item && item.type === 'point') {
                    props.explorerState.setSelectedDate(moment(item.start).toDate());
                    return;
                }
            }
            if (evt.what === 'custom-time') {
                return;
            }
            if (evt.what === 'group-label') {
                return;
            }
            if (evt.group) {
                let view = props.explorerState.getDataset(evt.group.toString());
                const provider = view?.timeDistributionViz?.config.provider;
                if (provider) {
                    let searchDirection = (selectedDate && evt.time > selectedDate)
                        ? TimeSearchDirection.Forward
                        : TimeSearchDirection.Backward;
                    provider.getNearestItem(evt.time, searchDirection).then(nearestItem => {
                        if (nearestItem) {
                            props.explorerState.setSelectedDate(nearestItem.start);
                        } else {
                            provider.getTimeExtent().then((timeExtent) => {
                                if (timeExtent) {
                                    if (evt.time > timeExtent.end) {
                                        props.explorerState.setSelectedDate(timeExtent.end);
                                    } else {
                                        props.explorerState.setSelectedDate(timeExtent.start);
                                    }
                                }
                            });
                        }
                    });
                    return;
                }
            }

            onSelectedDateChange(evt.time);
        }
    }, [timeSelectionMode, selectedDate]);

    useEffect(() => {

        if (timeExplorer) {
            timeExplorer.setActive(true);
        }
        let groupTracker = new ArrayTracker({
            items: props.explorerState.items,
            idGetter: (datasetView) => datasetView.dataset.id,
            onItemAdd: (datasetView, idx) => {

                const timeDistributionViz = datasetView.timeDistributionViz;
                if (!timeDistributionViz) {
                    return;
                }

                let groupId = datasetView.dataset.id;

                timelineGroups.current.add({
                    id: groupId,
                    className: datasetView.dataset.id.toString(),
                    content: '',
                    datasetView: datasetView,
                    visible: true,
                    zIndex: idx
                });

                let groupItemsTracker = new ArrayTracker({
                    items: timeDistributionViz.timeDistribution.items,
                    idGetter: (item) => `${datasetView.dataset.id}_${item.isoString}`,
                    onItemAdd: (item, idx) => {

                        let itemId = `${datasetView.dataset.id}_${item.isoString}`;

                        timelineItems.current.add({
                            id: itemId,
                            type: item.isRange ? 'range' : 'point',
                            content: '',
                            className: classnames({
                                'is-loading' : item.data?.loading,
                                'is-error': item.data?.error
                            }),
                            group: datasetView.dataset.id,
                            start: item.start,
                            end: item.end,
                            style: `background-color: ${datasetView.dataset.config.color}; border: none`
                        });

                        return () => {
                            timelineItems.current.remove(itemId);
                        };
                    },
                    onItemRemove: (disposer) => {
                        //@ts-ignore
                        disposer();
                    }
                });

                updateGroupsOrdering();

                return (() => {
                    groupItemsTracker.destroy();
                    timelineGroups.current.remove(groupId);
                });

            },
            onItemRemove: (disposer) => {
                if (disposer) {
                    //@ts-ignore
                    disposer();
                    updateGroupsOrdering();
                }
            }
        });


        let visibleRangeTrackerDisposer = autorun(() => {
            if (timeExplorer) {
                setVisibleRange(timeExplorer.visibleRange.range);
            }
        });


        if (!props.explorerState.selectedDate) {
            props.explorerState.setSelectedDate(new Date());
        }

        return (() => {
            if (timeExplorer) {
                timeExplorer.setActive(false);
            }
            groupTracker.destroy();
            visibleRangeTrackerDisposer();
        });

    }, []);

    useEffect(() => {
        if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Range) {
            const queryRangeTrackerDisposer = autorun(() => {
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
                    setEditableRanges([{
                        id: 'query',
                        enableDraw: true,
                        onRangeUpdate: (range) => {
                            props.explorerState.setToi(range);
                        }
                    }]);
                }
            });

            return () => {
                setEditableRanges([]);
                queryRangeTrackerDisposer();
            };
        } else {

            let queryRange = props.explorerState.toi;

            onSelectedDateChange(queryRange ? queryRange.end : new Date());

            return () => {
                props.explorerState.setSelectedDate(undefined);
            };
        }
    }, [timeSelectionMode]);

    return (
        <div className='dataset-explorer-timeline'>
            <DatasetExplorerTimelineToolbar
                onDrawRange={() => props.explorerState.setToi(undefined)}
                groupLabelsMode={groupLabelsMode}
                onGroupLabelsModeChange={(mode) => setGroupLabelsMode(mode)}
                timeSelectionMode={timeSelectionMode}
                onTimeSelectionModeChange={(mode) => setTimeSelectionMode(mode)}
                selectedTime={timeSelectionMode === DatasetTimelineTimeSelectionMode.Instant
                    ? props.explorerState.selectedDate
                    : props.explorerState.toi
                }
                onSelectedTimeChange={(value) => {
                    if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Instant) {
                        onSelectedDateChange(value as Date);
                    } else {
                        props.explorerState.setToi(value as DateRangeValue);
                    }
                }}
                onGoToTimeSelection={goToTimeSelection}
            />
            <Timeline
                range={visibleRange}
                timelineGroups={timelineGroups.current}
                timelineItems={timelineItems.current}
                editableRanges={editableRanges}
                onRangeChange={(range) => {
                    if (timeExplorer) {
                        timeExplorer.visibleRange.setRange(range.start!, range.end!);
                    }
                }}
                groupLabelsMode={groupLabelsMode}
                groupTemplate={(group: DatasetDiscoveryTimelineGroup, element: Element) => {
                    if (group && element !== group.element) {
                        // use timeout to avoid an infinite loop.
                        // doing an update during an add will generate a new element instead
                        // of calling the grouptemplate with the element just generated
                        setTimeout(() => {
                            // we just link the element to the group.
                            // the TimelineGroupTemplates component will generate a portal that will rendere the template into this element
                            timelineGroups.current.update({
                                id: group.id,
                                element: element
                            });
                        });
                    }

                    //this is the return format expected for a react element (probably they expect a React.createClass call)
                    return {
                        isReactComponent: true
                    } as unknown as string;

                }}
                selectedDates={selectedDate ? [{
                    id: 'selected-date',
                    value: selectedDate,
                    onDateChange: onSelectedDateChange
                }] : undefined}
                onSelectedChange={(item) => {

                }}
                onHoveredChange={(item) => {

                }}
                onClick={onTimelineClick}
            />
            <TimelineGroupTemplates groups={timelineGroups.current} explorerState={props.explorerState}/>
        </div>
    );
};
