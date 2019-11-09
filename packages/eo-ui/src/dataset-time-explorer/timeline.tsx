import React, { useRef, useEffect, useState } from 'react';

import classNames from 'classnames';
import { DateRange } from '@oida/core';

import moment from 'moment';

import {
    Timeline as VisTimeline,
    TimelineItem, TimelineGroup, DataSet, timeline as timelineExports,
    TimelineOptions, TimelineOptionsTemplateFunction
} from 'vis-timeline';

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
         this.dom.box['timeline-item'] = this; // <-- un-commented from original timeline

         this.dirty = true;
    }
};


export type TimelineProps = {
    className?: string,
    timelineItems: TimelineItem[] | DataSet<TimelineItem>,
    timelineGroups: TimelineGroup[] | DataSet<TimelineGroup>,
    itemTemplate?: TimelineOptionsTemplateFunction,
    groupTemplate?: TimelineOptionsTemplateFunction,
    range: DateRange,
    editableRanges?: Array<{id: string, step?: string, enableDraw?: boolean, onRangeUpdate: (range) => void} & DateRange>,
    onRangeChange: (range: DateRange) => void,
    onHoveredChange: (item: TimelineItem, hovered: boolean) => void,
    onSelectedChange: (item: TimelineItem | null) => void,
    onGroupHoveredChange?: (group: TimelineGroup, hovered: boolean) => void
};

export enum TimelineItemType {
    EditableRange = 'editableRange'
}

const getTimelineItem = (id: string, items: TimelineItem[] | DataSet<TimelineItem>) => {
    if (Array.isArray(items)) {
        items.find((item) => {
            return item.id === id;
        });
    } else {
        return items.get(id);
    }
};


export const Timeline = (props: TimelineProps) => {

    let containerRef = useRef<HTMLDivElement>(null);

    let [ timeline, setTimeline ] = useState<VisTimeline>();
    let [ wasRangeChangedFromTimeline, setWasRangeChangedFromTimeline] = useState(false);

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
                    if (item.itemType === TimelineItemType.EditableRange) {
                        item.onRangeUpdate({
                            start: item.start,
                            end: item.end
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

            timelineInstance.on('timechanged', ({id, time}) => {

                let match = id.match(/(.*)\.range\.(start|end)$/);

                if (match) {
                    let rangeId = match[1];

                    let rangeItem = props.timelineItems.get(rangeId);
                    rangeItem.onRangeUpdate({
                        start: rangeItem.start,
                        end: rangeItem.end
                    });
                }
            });


            setTimeline(timelineInstance);

            return () => {
                timelineInstance.destroy();
                setTimeline(null);
            };
        }

    }, [containerRef]);

    useEffect(() => {
        if (timeline) {
            timeline.setOptions({
                onMoving: (item, callback) => {
                    if (item.itemType === TimelineItemType.EditableRange) {
                        let startMarkerId = `${item.id}.range.start`;
                        let endMarkerId = `${item.id}.range.end`;

                        timeline.setCustomTime(item.start, startMarkerId);
                        timeline.setCustomTime(item.end, endMarkerId);

                        callback({
                            ...item,
                            dragging: true,
                            className: item.dragging ? item.className : `${item.className} dragging`
                        });
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
            if (timeline) {
                timeline.setWindow(props.range.start, props.range.end, {
                    animation: false
                });
            }
        }
    }, [timeline, props.range]);

    useEffect(() => {

        let rangeIds : Array<string> = [];
        let cancelRangeDraw;

        if (timeline && props.editableRanges && props.timelineItems) {

            props.editableRanges.forEach((range) => {

                if (!range.enableDraw) {
                    rangeIds.push(range.id);

                    let startMarkerId = `${range.id}.range.start`;
                    let endMarkerId = `${range.id}.range.end`;

                    timeline.addCustomTime(range.start, startMarkerId);
                    timeline.addCustomTime(range.end, endMarkerId);

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

                    props.timelineItems.add(selectionRange);

                    timeline.setSelection(range.id);
                } else {

                    let startMarkerId = `${range.id}.range.start`;
                    let endMarkerId = `${range.id}.range.end`;

                    const onMoveBeforeDrawStart = (evt) => {

                        let evtTime = timeline.getEventProperties(evt).time;

                        try {
                            timeline.setCustomTime(evtTime, startMarkerId);
                        } catch (e) {
                            timeline.addCustomTime(evtTime, startMarkerId);
                        }
                    };

                    const onDrawStart = (evt) => {

                        timeline.setCustomTime(evt.time, startMarkerId);
                        timeline.addCustomTime(evt.time, endMarkerId);

                        let selectionRange = {
                            id: range.id,
                            content: '',
                            start: evt.time,
                            end: evt.time,
                            type: 'background',
                            className: `editable-range ${range.id}`,
                            itemType: TimelineItemType.EditableRange,
                        };

                        props.timelineItems.add(selectionRange);

                        containerRef.current!.removeEventListener('mousemove', onMoveBeforeDrawStart);
                        timeline.off('click', onDrawStart);
                        timeline.on('click', onDrawEnd);
                        containerRef.current!.addEventListener('mousemove', onDrawMove);
                    };

                    const onDrawMove = (evt) => {

                        let evtTime = timeline.getEventProperties(evt).time;

                        timeline.setCustomTime(evtTime, endMarkerId);
                        props.timelineItems.update({
                            id: range.id,
                            end: evtTime
                        });
                    };

                    const onDrawEnd = (evt) => {

                        timeline.setCustomTime(evt.time, endMarkerId);

                        props.timelineItems.update({
                            id: range.id,
                            end: evt.time
                        });

                        range.onRangeUpdate({
                            start: timeline.getCustomTime(startMarkerId),
                            end: evt.time
                        });

                        timeline.off('click', onDrawEnd);
                        containerRef.current!.removeEventListener('mousemove', onDrawMove);
                    };

                    cancelRangeDraw = () => {
                        timeline.off('click', onDrawStart);
                        timeline.off('click', onDrawEnd);
                        containerRef.current!.removeEventListener('mousemove', onMoveBeforeDrawStart);
                        containerRef.current!.removeEventListener('mousemove', onDrawMove);

                        timeline.removeCustomTime(startMarkerId);
                        try {
                            timeline.removeCustomTime(endMarkerId);
                        } catch (e) {

                        }
                        props.timelineItems.remove(range.id);
                    };

                    containerRef.current!.addEventListener('mousemove', onMoveBeforeDrawStart);
                    timeline.on('click', onDrawStart);
                }

            });
        }

        return () => {
            rangeIds.forEach((id) => {
                props.timelineItems.remove(id);
                timeline.removeCustomTime(`${id}.range.start`);
                timeline.removeCustomTime(`${id}.range.end`);
            });
            if (cancelRangeDraw) {
                cancelRangeDraw();
            }
        };

    }, [timeline, props.timelineItems, props.editableRanges]);

    return (
        <div
            className={classNames('timeline', props.className)}
            ref={containerRef}
        >
        </div>
    );
};

