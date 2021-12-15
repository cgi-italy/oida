import React, { useRef, useEffect, useState } from 'react';

import classNames from 'classnames';
import { DateRange } from '@oidajs/core';

import moment from 'moment';

import { DataSet } from 'vis-data/peer';

// @ts-ignore
import { timeline as timelineExports } from 'vis-timeline/peer';

import {
    Timeline as VisTimeline,
    TimelineItem, TimelineGroup,
    TimelineOptions, TimelineOptionsTemplateFunction,
    TimelineEventPropertiesResult
} from 'vis-timeline/peer';

import 'vis-timeline/dist/vis-timeline-graph2d.css';


timelineExports.components.items.BackgroundItem.prototype._createDomElement = function() {
    if (!this.dom) {
        // create DOM
        this.dom = {};

        // background box
        this.dom.box = document.createElement('div');
        // className is updated in redraw()

        // frame box (to prevent the item contents from overflowing
        this.dom.frame = document.createElement('div');
        this.dom.frame.className = 'vis-item-overflow';
        this.dom.box.appendChild(this.dom.frame);

        // contents box
        this.dom.content = document.createElement('div');
        this.dom.content.className = 'vis-item-content';
        this.dom.frame.appendChild(this.dom.content);

        // Note: we do NOT attach this item as attribute to the DOM,
        //       such that background items cannot be selected
        this.dom.box['vis-item'] = this; // <-- un-commented from original timeline

        this.dirty = true;
    }
};

export enum TimelineItemType {
    EditableRange = 'editableRange'
}

export type EditableRangeItem = TimelineItem & {
    itemType: string,
    onRangeUpdate: (range: DateRange) => void,
    dragging: boolean
};

function isRangeItem(item: EditableRangeItem | TimelineItem): item is EditableRangeItem {
    return (item as EditableRangeItem).itemType === TimelineItemType.EditableRange;
}

export enum TimelineGroupLabelsMode {
    Hidden = 'hidden',
    Overlay = 'overlay',
    Block = 'block'
}

export type TimelineProps = {
    className?: string,
    timelineItems: DataSet<TimelineItem | EditableRangeItem>,
    timelineGroups: DataSet<TimelineGroup>,
    itemTemplate?: TimelineOptionsTemplateFunction,
    groupTemplate?: TimelineOptionsTemplateFunction,
    disableGrouping?: boolean;
    range: DateRange,
    groupLabelsMode?: TimelineGroupLabelsMode,
    editableRanges?: Array<{id: string, step?: string, enableDraw?: boolean, onRangeUpdate: (range) => void} & DateRange>,
    selectedDates?: Array<{id: string, value: Date, onDateChange: (value: Date) => void}>
    onRangeChange: (range: DateRange) => void,
    onClick?: (evt: TimelineEventPropertiesResult) => void,
    onHoveredChange: (item: TimelineItem, hovered: boolean) => void,
    onSelectedChange: (item: TimelineItem | null) => void,
    onGroupHoveredChange?: (group: TimelineGroup, hovered: boolean) => void
};

export const Timeline = (props: TimelineProps) => {

    let containerRef = useRef<HTMLDivElement>(null);

    const [timeline, setTimeline] = useState<VisTimeline>();
    const [wasRangeChangedFromTimeline, setWasRangeChangedFromTimeline] = useState(false);
    const [nextClickEventDisabled, setNextClickEventDisabled] = useState(false);

    useEffect(() => {

        if (containerRef.current) {
            let timelineOptions: TimelineOptions = {
                moment: moment.utc,
                showCurrentTime: false,
                selectable: false,
                maxHeight: '100%',
                groupOrder: function(a, b) {
                    return a.zIndex - b.zIndex;
                },
                snap: null,
                stack: false,
                start: props.range.start,
                end: props.range.end,
                editable: false,
                onMove: (item, callback) => {
                    if (isRangeItem(item)) {
                        item.onRangeUpdate({
                            start: item.start as Date,
                            end: item.end as Date
                        });
                    }
                }
            };

            if (props.groupTemplate) {
                timelineOptions.groupTemplate = props.groupTemplate;
            }
            if (props.itemTemplate) {
                timelineOptions.template = props.itemTemplate;
            }

            let timelineInstance = new VisTimeline(containerRef.current, props.timelineItems, props.timelineGroups, timelineOptions);

            timelineInstance.on('rangechange', (evt) => {
                if (evt.byUser) {

                    setWasRangeChangedFromTimeline(true);

                    props.onRangeChange({
                        start: evt.start,
                        end: evt.end
                    });
                }
            });

            timelineInstance.on('timechange', ({id, time}) => {

                let match = id.match(/(.*)\.range\.(start|end)$/);

                if (match) {
                    let rangeId = match[1];

                    if (match[2] === 'start') {
                        props.timelineItems.update({
                            id: rangeId,
                            start: time
                        });
                    } else if (match[2] === 'end') {
                        props.timelineItems.update({
                            id: rangeId,
                            end: time
                        });
                    }
                }
            });

            setTimeline(timelineInstance);

            return () => {
                timelineInstance.destroy();
                setTimeline(undefined);
            };
        }

    }, [containerRef]);

    useEffect(() => {
        const timelineInstance = timeline;
        const onClick = props.onClick;
        if (timelineInstance && onClick) {

            let isClick = !nextClickEventDisabled;

            const onTimelineClick = (evt) => {
                if (!isClick) {
                    isClick = true;
                    setNextClickEventDisabled(false);
                } else {
                    onClick(evt);
                }
            };

            const disableClick = () => {
                isClick = false;
                setNextClickEventDisabled(true);
            };

            const enableClick = () => {
                setTimeout(() => {
                    isClick = true;
                    setNextClickEventDisabled(false);
                }, 0);
            };

            timelineInstance.on('rangechange', disableClick);
            timelineInstance.on('timechange', disableClick);
            timelineInstance.on('rangechanged', enableClick);
            timelineInstance.on('timechanged', enableClick);
            timelineInstance.on('click', onTimelineClick);

            return () => {
                // @ts-ignore
                if (timelineInstance.dom) {
                    timelineInstance.off('click', onTimelineClick);
                    timelineInstance.off('rangechanged', enableClick);
                    timelineInstance.off('timechanged', enableClick);
                    timelineInstance.off('rangechange', disableClick);
                    timelineInstance.off('timechange', disableClick);
                }
            };
        }
    }, [timeline, props.onClick]);

    useEffect(() => {
        const timelineInstance = timeline;
        if (timelineInstance) {
            setTimeout(() => timelineInstance.redraw());
        }
    }, [timeline, props.groupLabelsMode]);

    useEffect(() => {
        const timelineInstance = timeline;
        if (timelineInstance) {

            let onTimeChanged = ({id, time}) => {
                let match = id.match(/(.*)\.range\.(start|end)$/);

                if (match) {
                    let rangeId: string = match[1];

                    let item = props.timelineItems.get(rangeId);
                    if (item && isRangeItem(item)) {
                        item.onRangeUpdate({
                            start: item.start as Date,
                            end: item.end as Date
                        });
                    }
                } else if (props.selectedDates) {
                    let item = props.selectedDates.find(item => item.id === id);
                    if (item) {
                        item.onDateChange(time);
                    }
                }
            };

            timelineInstance.on('timechanged', onTimeChanged);

            return () => {
                // @ts-ignore
                if (timelineInstance.dom) {
                    timelineInstance.off('timechanged', onTimeChanged);
                }
            };
        }

    }, [timeline, props.timelineItems, props.selectedDates]);

    useEffect(() => {

        const timelineInstance = timeline;
        if (timelineInstance) {
            timelineInstance.setOptions({
                onMoving: (item, callback) => {
                    if (isRangeItem(item)) {
                        let startMarkerId = `${item.id}.range.start`;
                        let endMarkerId = `${item.id}.range.end`;

                        timelineInstance.setCustomTime(item.start, startMarkerId);
                        timelineInstance.setCustomTime(item.end || item.start, endMarkerId);

                        callback({
                            ...item,
                            dragging: true,
                            className: item.dragging ? item.className : `${item.className} dragging`
                        } as TimelineItem);
                    }
                },
            });
        }
    }, [timeline]);

    useEffect(() => {
        if (timeline) {
            timeline.setItems(props.timelineItems);
        }
    }, [timeline, props.timelineItems]);

    useEffect(() => {
        if (timeline) {
            timeline.setGroups(props.timelineGroups);
        }
    }, [timeline, props.timelineGroups]);

    useEffect(() => {
        if (wasRangeChangedFromTimeline) {
            setWasRangeChangedFromTimeline(false);
        } else {
            if (timeline && props.range.start && props.range.end) {
                timeline.setWindow(props.range.start, props.range.end, {
                    animation: false
                });
            }
        }
    }, [timeline, props.range]);

    useEffect(() => {

        const timelineInstance = timeline;

        if (timelineInstance && props.selectedDates) {
            let ids = props.selectedDates.map((item) => {
                return timelineInstance.addCustomTime(item.value, item.id);
            });

            return () => {
                // @ts-ignore
                if (timelineInstance.dom) {
                    ids.forEach((id) => {
                        timelineInstance.removeCustomTime(id);
                    });
                }
            };
        }

    }, [timeline, props.selectedDates]);

    useEffect(() => {

        let rangeIds : Array<string> = [];
        let cancelRangeDraw;

        const timelineInstance = timeline;

        if (timelineInstance && props.editableRanges && props.timelineItems) {

            props.editableRanges.forEach((range) => {

                if (!range.enableDraw && range.start && range.end) {
                    rangeIds.push(range.id);

                    let startMarkerId = `${range.id}.range.start`;
                    let endMarkerId = `${range.id}.range.end`;

                    timelineInstance.addCustomTime(range.start, startMarkerId);
                    timelineInstance.addCustomTime(range.end, endMarkerId);

                    let selectionRange = {
                        id: range.id,
                        content: '',
                        start: range.start,
                        end: range.end,
                        type: 'background',
                        className: `editable-range ${range.id}`,
                        itemType: TimelineItemType.EditableRange,
                        editable: true,
                        selectable: true,
                        onRangeUpdate: range.onRangeUpdate
                    };

                    props.timelineItems.add(selectionRange as TimelineItem);

                    timelineInstance.setSelection(range.id);
                } else {

                    let startMarkerId = `${range.id}.range.start`;
                    let endMarkerId = `${range.id}.range.end`;

                    const onMoveBeforeDrawStart = (evt) => {

                        let evtTime = timelineInstance.getEventProperties(evt).time;

                        try {
                            timelineInstance.setCustomTime(evtTime, startMarkerId);
                        } catch (e) {
                            timelineInstance.addCustomTime(evtTime, startMarkerId);
                        }
                    };

                    const onDrawStart = (evt) => {

                        timelineInstance.setCustomTime(evt.time, startMarkerId);
                        timelineInstance.addCustomTime(evt.time, endMarkerId);

                        let selectionRange = {
                            id: range.id,
                            content: '',
                            start: evt.time,
                            end: evt.time,
                            type: 'background',
                            className: `editable-range ${range.id}`,
                            itemType: TimelineItemType.EditableRange,
                        };

                        props.timelineItems.add(selectionRange as TimelineItem);

                        containerRef.current!.removeEventListener('mousemove', onMoveBeforeDrawStart);
                        timelineInstance.off('click', onDrawStart);
                        timelineInstance.on('click', onDrawEnd);
                        containerRef.current!.addEventListener('mousemove', onDrawMove);
                    };

                    const onDrawMove = (evt) => {

                        let evtTime = timelineInstance.getEventProperties(evt).time;

                        timelineInstance.setCustomTime(evtTime, endMarkerId);
                        props.timelineItems.update({
                            id: range.id,
                            end: evtTime
                        });
                    };

                    const onDrawEnd = (evt) => {

                        timelineInstance.setCustomTime(evt.time, endMarkerId);

                        props.timelineItems.update({
                            id: range.id,
                            end: evt.time
                        });

                        range.onRangeUpdate({
                            start: timelineInstance.getCustomTime(startMarkerId),
                            end: evt.time
                        });

                        timelineInstance.off('click', onDrawEnd);
                        containerRef.current!.removeEventListener('mousemove', onDrawMove);
                    };

                    cancelRangeDraw = () => {
                        timelineInstance.off('click', onDrawStart);
                        timelineInstance.off('click', onDrawEnd);
                        containerRef.current!.removeEventListener('mousemove', onMoveBeforeDrawStart);
                        containerRef.current!.removeEventListener('mousemove', onDrawMove);

                        try {
                            timelineInstance.removeCustomTime(startMarkerId);
                            timelineInstance.removeCustomTime(endMarkerId);
                        } catch (e) {

                        }
                        props.timelineItems.remove(range.id);
                    };

                    containerRef.current!.addEventListener('mousemove', onMoveBeforeDrawStart);
                    timelineInstance.on('click', onDrawStart);
                }

            });

            return () => {
                // @ts-ignore
                if (timelineInstance.dom) {
                    rangeIds.forEach((id) => {
                        props.timelineItems.remove(id);
                        timelineInstance.removeCustomTime(`${id}.range.start`);
                        timelineInstance.removeCustomTime(`${id}.range.end`);
                    });
                    if (cancelRangeDraw) {
                        cancelRangeDraw();
                    }
                }
            };
        }

    }, [timeline, props.timelineItems, props.editableRanges]);

    return (
        <div
            className={classNames('timeline', props.className, {
                'groups-labels-overlay': props.groupLabelsMode === TimelineGroupLabelsMode.Overlay,
                'groups-labels-hidden': props.groupLabelsMode === TimelineGroupLabelsMode.Hidden,
            })}
            ref={containerRef}
        >
        </div>
    );
};

