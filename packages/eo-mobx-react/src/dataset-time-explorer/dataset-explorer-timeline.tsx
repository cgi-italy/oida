import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { autorun } from 'mobx';
import classnames from 'classnames';
import { TimelineGroup, TimelineItem, TimelineEventPropertiesResult } from 'vis-timeline/peer';
import { DataSet } from 'vis-data/peer';
import moment from 'moment';

import { Button, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { AOI_FIELD_ID, DateRangeValue } from '@oidajs/core';
import { ArrayTracker } from '@oidajs/state-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetExplorer, DatasetExplorerItem, TimeSearchDirection, getNearestDatasetProduct } from '@oidajs/eo-mobx';

import { Timeline, TimelineGroupLabelsMode } from './timeline';
import { DatasetExplorerTimelineToolbar } from './dataset-explorer-timeline-toolbar';

export enum DatasetTimelineTimeSelectionMode {
    Instant = 'instant',
    Range = 'range'
}

export type DatasetExplorerTimelineProps = {
    explorerState: DatasetExplorer;
    title?: string;
};

export type DatasetDiscoveryTimelineGroup = TimelineGroup & {
    datasetView: DatasetExplorerItem;
    element?: Element;
    zIndex: number;
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

    const timeDistribution = datasetView.timeDistributionViz;

    if (timeDistribution) {
        centerTimeExtentButton = (
            <Tooltip title='Zoom to dataset time extent'>
                <Button
                    size='small'
                    type='link'
                    onClick={() => {
                        const filters = datasetView.dataset.additionalFilters.asArray();
                        const aoi = datasetView.dataset.aoi;
                        if (aoi) {
                            filters.push({
                                key: 'aoi',
                                type: AOI_FIELD_ID,
                                value: aoi
                            });
                        }

                        timeDistribution.config.provider.getTimeExtent(timeDistribution.filters).then((range) => {
                            if (range) {
                                props.explorerState.timeExplorer?.timeRange.centerRange(new Date(range.start), new Date(range.end), {
                                    margin: 0.1,
                                    animate: true
                                });
                            }
                        });
                    }}
                >
                    <SearchOutlined />
                </Button>
            </Tooltip>
        );
    }
    return (
        <div className='dataset-timeline-group-label'>
            <div className='dataset-timeline-group-name'>{datasetView.dataset.config.name}</div>
            <div className='dataset-timeline-group-actions'>{centerTimeExtentButton}</div>
        </div>
    );
};

export type TimelineGroupTemplatesProps = {
    groups: DataSet<DatasetDiscoveryTimelineGroup>;
    explorerState: DatasetExplorer;
};
export const TimelineGroupTemplates = (props: TimelineGroupTemplatesProps) => {
    const [groupTemplates, setGroupTemplates] = useState<React.ReactPortal[]>([]);

    useEffect(() => {
        const groups = props.groups;
        const onGroupsUpdate = () => {
            const groupTemplates = groups.map((group) => {
                if (group.element) {
                    return ReactDOM.createPortal(
                        <DatasetTimelineGroupTemplate key={group.id} datasetView={group.datasetView} explorerState={props.explorerState} />,
                        group.element
                    );
                }
            });
            setGroupTemplates(groupTemplates.filter((portal) => !!portal) as React.ReactPortal[]);
        };

        groups.on('*', onGroupsUpdate);

        return () => {
            groups.off('*', onGroupsUpdate);
        };
    }, [props.groups]);

    return <React.Fragment>{groupTemplates}</React.Fragment>;
};

export const DatasetDiscoveryTimeline = (props: DatasetExplorerTimelineProps) => {
    const timeExplorer = props.explorerState.timeExplorer;

    let runningRequest: Promise<any> | undefined;
    const onSelectedDateChange = (date: Date) => {
        if (runningRequest && runningRequest.cancel) {
            runningRequest.cancel();
        }
        const searchDirection =
            selectedToi instanceof Date && date > selectedToi ? TimeSearchDirection.Forward : TimeSearchDirection.Backward;

        runningRequest = getNearestDatasetProduct(date, searchDirection, props.explorerState.items).then((nearestItem) => {
            runningRequest = undefined;
            if (nearestItem) {
                props.explorerState.setToi(nearestItem);
                if (timeExplorer) {
                    setVisibleRange({
                        ...timeExplorer.timeRange.value
                    });
                }
            } else {
                props.explorerState.setToi(date);
            }
        });
    };

    const goToTimeSelection = () => {
        const toi = props.explorerState.toi;
        if (timeExplorer && toi) {
            if (toi instanceof Date) {
                timeExplorer.timeRange.centerDate(toi, {
                    animate: true
                });
            } else {
                timeExplorer.timeRange.centerRange(toi.start, toi.end, {
                    margin: 0.2,
                    animate: true
                });
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

    const [visibleRange, setVisibleRange] = useState(
        timeExplorer
            ? timeExplorer.timeRange.value
            : {
                  start: moment.utc().subtract(1, 'month').toDate(),
                  end: moment.utc().toDate()
              }
    );
    const [editableRanges, setEditableRanges] = useState<any>([]);
    const [groupLabelsMode, setGroupLabelsMode] = useState(TimelineGroupLabelsMode.Block);
    const [timeSelectionMode, setTimeSelectionMode] = useState(DatasetTimelineTimeSelectionMode.Instant);
    const [isCompressed, setIsCompressed] = useState(false);

    const selectedToi = useSelector(() => props.explorerState.toi);

    const onTimelineClick = useCallback(
        (evt: TimelineEventPropertiesResult) => {
            if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Instant) {
                if (!evt.what) {
                    return;
                }
                if (evt.what === 'item' && evt.item) {
                    const item = timelineItems.current.get(evt.item);
                    if (item && item.type === 'point') {
                        const dt = moment(item.start).toDate();
                        // click on specific product check for the corresponding dataset
                        if (item.group) {
                            const explorerItem = props.explorerState.getDataset(item.group.toString());
                            if (explorerItem) {
                                // dataset found. set the toi there.
                                // if time sync is enabled on the dataset it will be propagated to the explorer
                                explorerItem.dataset.setToi(dt);
                                return;
                            }
                        }
                        // dataset not found. set the toi globally on the explorer
                        props.explorerState.setToi(dt);
                        return;
                    }
                }
                if (evt.what === 'custom-time') {
                    // click on the time indicator. do nothing
                    return;
                }
                if (evt.what === 'group-label') {
                    // click inside the product labels area. do nothing
                    return;
                }
                if (evt.group) {
                    // click within a dataset line. find the nearest product for that specific dataset
                    const explorerItem = props.explorerState.getDataset(evt.group.toString());
                    const provider = explorerItem?.timeDistributionViz?.config.provider;
                    if (provider) {
                        const searchDirection =
                            explorerItem?.dataset.toi instanceof Date && evt.time > explorerItem?.dataset.toi
                                ? TimeSearchDirection.Forward
                                : TimeSearchDirection.Backward;
                        provider.getNearestItem(evt.time, searchDirection).then((nearestItem) => {
                            if (nearestItem) {
                                explorerItem!.dataset.setToi(nearestItem.start);
                            } else {
                                // check for out of dataset range click
                                provider.getTimeExtent().then((timeExtent) => {
                                    if (timeExtent) {
                                        if (evt.time > timeExtent.end) {
                                            explorerItem!.dataset.setToi(timeExtent.end);
                                        } else {
                                            explorerItem!.dataset.setToi(timeExtent.start);
                                        }
                                    }
                                });
                            }
                        });
                        return;
                    }
                }
                // search for the nearest product for all datasets
                onSelectedDateChange(evt.time);
            }
        },
        [timeSelectionMode, selectedToi]
    );

    useEffect(() => {
        if (timeExplorer) {
            timeExplorer.setActive(true);
        }
        const groupTracker = new ArrayTracker({
            items: props.explorerState.items,
            idGetter: (datasetView) => datasetView.dataset.id,
            onItemAdd: (datasetView, idx) => {
                const timeDistributionViz = datasetView.timeDistributionViz;
                if (!timeDistributionViz) {
                    return;
                }

                const groupId = datasetView.dataset.id;

                timelineGroups.current.add({
                    id: groupId,
                    className: datasetView.dataset.id.toString(),
                    content: '',
                    datasetView: datasetView,
                    visible: true,
                    zIndex: idx
                });

                const groupItemsTracker = new ArrayTracker({
                    items: timeDistributionViz.timeDistribution.items,
                    idGetter: (item) => `${datasetView.dataset.id}_${item.isoString}`,
                    onItemAdd: (item, idx) => {
                        const itemId = `${datasetView.dataset.id}_${item.isoString}`;

                        timelineItems.current.add({
                            id: itemId,
                            type: item.isRange ? 'range' : 'point',
                            content: '',
                            className: classnames({
                                'is-loading': item.data?.loading,
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

                //highlight the currently selected granule for the dataset
                const selectedGranuleId = `${datasetView.dataset.id}_selected_granule`;
                const selectedGranuleHighlightDisposer = autorun(() => {
                    const toi = datasetView.dataset.toi;
                    if (toi instanceof Date) {
                        if (timelineItems.current.get(selectedGranuleId)) {
                            timelineItems.current.update({
                                id: selectedGranuleId,
                                start: toi,
                                end: toi
                            });
                        } else {
                            timelineItems.current.add({
                                id: selectedGranuleId,
                                content: '',
                                type: 'point',
                                className: 'dataset-selected-granule',
                                group: datasetView.dataset.id,
                                start: toi,
                                end: toi,
                                style: `background-color: ${datasetView.dataset.config.color};`
                            });
                        }
                    } else {
                        timelineItems.current.remove(selectedGranuleId);
                    }
                });

                updateGroupsOrdering();

                return () => {
                    groupItemsTracker.destroy();
                    timelineGroups.current.remove(groupId);
                    selectedGranuleHighlightDisposer();
                    timelineItems.current.remove(selectedGranuleId);
                };
            },
            onItemRemove: (disposer) => {
                if (disposer) {
                    //@ts-ignore
                    disposer();
                    updateGroupsOrdering();
                }
            }
        });

        const visibleRangeTrackerDisposer = autorun(() => {
            if (timeExplorer) {
                setVisibleRange(timeExplorer.timeRange.value);
            }
        });

        return () => {
            if (timeExplorer) {
                timeExplorer.setActive(false);
            }
            groupTracker.destroy();
            visibleRangeTrackerDisposer();
        };
    }, []);

    useEffect(() => {
        if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Range) {
            const queryRangeTrackerDisposer = autorun(() => {
                const queryRange = props.explorerState.toi;

                if (queryRange && !(queryRange instanceof Date)) {
                    setEditableRanges([
                        {
                            id: 'query',
                            start: queryRange.start,
                            end: queryRange.end,
                            onRangeUpdate: (range) => {
                                props.explorerState.setToi(range);
                            }
                        }
                    ]);
                } else {
                    setEditableRanges([
                        {
                            id: 'query',
                            enableDraw: true,
                            onRangeUpdate: (range) => {
                                props.explorerState.setToi(range);
                            }
                        }
                    ]);
                }
            });

            return () => {
                setEditableRanges([]);
                queryRangeTrackerDisposer();
            };
        } else {
            const toi = props.explorerState.toi;

            if (toi) {
                if (!(toi instanceof Date)) {
                    // when switching from range mode to instant mode we select the product nearest to the current range end
                    onSelectedDateChange(toi.end);
                }
            } else {
                onSelectedDateChange(new Date());
            }

            return () => {
                props.explorerState.setToi(undefined);
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
                selectedTime={selectedToi}
                onSelectedTimeChange={(value) => {
                    if (timeSelectionMode === DatasetTimelineTimeSelectionMode.Instant) {
                        onSelectedDateChange(value as Date);
                    } else {
                        props.explorerState.setToi(value as DateRangeValue);
                    }
                }}
                onGoToPrevItem={() => {
                    if (selectedToi instanceof Date) {
                        onSelectedDateChange(new Date(selectedToi.getTime() - 1));
                    }
                }}
                onGoToNextItem={() => {
                    if (selectedToi instanceof Date) {
                        onSelectedDateChange(new Date(selectedToi.getTime() + 1));
                    }
                }}
                onGoToTimeSelection={goToTimeSelection}
                isCompressed={isCompressed}
                onCompressToggle={() => setIsCompressed((compressed) => !compressed)}
                rangeModeDisabled={props.explorerState.config.timeExplorer?.rangeModeDisabled}
                title={props.title}
            />
            {
                <Timeline
                    className={classnames({ 'is-compressed': isCompressed })}
                    range={visibleRange}
                    timelineGroups={timelineGroups.current}
                    timelineItems={timelineItems.current}
                    editableRanges={editableRanges}
                    onRangeChange={(range) => {
                        if (timeExplorer) {
                            timeExplorer.timeRange.setValue(range.start!, range.end!);
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
                    selectedDates={
                        selectedToi instanceof Date
                            ? [
                                  {
                                      id: 'selected-date',
                                      value: selectedToi,
                                      onDateChange: onSelectedDateChange
                                  }
                              ]
                            : undefined
                    }
                    onSelectedChange={(item) => {
                        // do nothing
                    }}
                    onHoveredChange={(item) => {
                        // do nothing
                    }}
                    onClick={onTimelineClick}
                />
            }
            <TimelineGroupTemplates groups={timelineGroups.current} explorerState={props.explorerState} />
        </div>
    );
};
