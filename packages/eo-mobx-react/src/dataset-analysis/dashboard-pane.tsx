import React, { useState, useEffect } from 'react';

import GridLayout from 'react-grid-layout';
import useResizeAware from 'react-resize-aware';

import { Button, Typography } from 'antd';
import { DragOutlined, CloseOutlined } from '@ant-design/icons';

import { LayoutSectionItem, LayoutSectionProps } from '@oidajs/ui-react-core';

import 'react-grid-layout/css/styles.css';

/**
 * {@link DashboardPane} item position type
 */
export type DashboardItemPosition = {
    /** the item left position (grid column) */
    x: number;
    /** the item top position (grid row) */
    y: number;
    /** the item width (number of grid columns) */
    w: number;
    /** the item height (number of grid rows) */
    h: number;
};

/**
 * {@link DashboardPane} component properties.
 * Check [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout#grid-layout-props) for more details
 * on the layout specific properties
 */
export type DashboardPaneProps = {
    /** Number of dashboard snap columns*/
    numCols: number;
    /** Dashboard snap row height*/
    rowSnapHeight?: number;
    /** Widget compacting method */
    compactType?: 'vertical' | 'horizontal' | null;
    /** Prevent collisions between widgets */
    preventCollision?: boolean;
    /** Dashboard style */
    style?: React.CSSProperties;
    /** Default position of newly added components */
    defaultWidgetPosition?: DashboardItemPosition;
    /** Container visible height. it is used when compact type is null to try and avoid scrolling (vertical compacting) */
    containerHeight?: number;
};

/**
 * A layout section container that display the child components as dashboard widgets
 * It uses [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) under the hood
 *
 * @param props the component properties
 */
export const DashboardPane = (props: LayoutSectionProps & DashboardPaneProps) => {
    const widgetMargin = 10;

    const rowSnapHeight = (props.rowSnapHeight || 30) + widgetMargin;

    const getInitialLayout = (component: LayoutSectionItem) => {
        //@ts-ignore
        const preferredLayout = component.preferredLayout;
        const height = props.containerHeight || size.height;
        if (preferredLayout && size.width && height) {
            const w = Math.floor(Math.min(preferredLayout.width / size.width, 1.0) * props.numCols);
            const h = Math.floor(Math.min(height, preferredLayout.height) / rowSnapHeight);
            let x = 0;
            let y = 0;
            if (!preferredLayout.position || preferredLayout.position === 'tr') {
                x = props.numCols - w;
            } else if (preferredLayout.position === 'bl') {
                y = Math.floor((height - preferredLayout.height) / rowSnapHeight);
            } else if (preferredLayout.position === 'br') {
                x = props.numCols - w;
                y = Math.floor((height - preferredLayout.height) / rowSnapHeight);
            }
            x = Math.max(0, x);
            y = Math.max(0, y);
            return {
                x,
                y,
                w,
                h
            };
        } else {
            return (
                props.defaultWidgetPosition || {
                    x: 0,
                    y: 0,
                    w: props.numCols,
                    h: 8
                }
            );
        }
    };

    const compactOverflowComponents = (updatedLayout) => {
        //compute the maximum visible y (in dashboard coordinates)
        const maxY = props.containerHeight ? Math.floor((props.containerHeight - widgetMargin) / rowSnapHeight) : undefined;
        if (maxY) {
            for (const id in updatedLayout) {
                if (updatedLayout[id].y + updatedLayout[id].h > maxY) {
                    updatedLayout[id] = {
                        ...updatedLayout[id],
                        y: Math.max(0, maxY - updatedLayout[id].h),
                        moved: true
                    };
                }
            }
        }
    };

    const getLayoutFromComponents = (currentLayout) => {
        const updatedLayout = {};
        props.components.forEach((component) => {
            if (currentLayout && currentLayout[component.id]) {
                updatedLayout[component.id] = currentLayout[component.id];
            } else {
                const position = closedWidgetsLayout[component.id] || getInitialLayout(component);
                updatedLayout[component.id] = {
                    i: component.id,
                    ...position
                };
            }
        });

        if (!props.compactType && !props.preventCollision) {
            compactOverflowComponents(updatedLayout);
        }

        return updatedLayout;
    };

    const [resizeListener, size] = useResizeAware();
    const [closedWidgetsLayout, setClosedWidgetsLayout] = useState({});
    const [layout, setLayout] = useState(() => getLayoutFromComponents({}));
    const [updateTracker] = useState<{ evt?: { type: string; item?: any } }>({
        evt: undefined
    });

    const widgets = props.components.map((component) => {
        if (!layout[component.id]) {
            const position = closedWidgetsLayout[component.id] || getInitialLayout(component);
            setLayout({
                ...layout,
                [component.id]: {
                    i: component.id,
                    ...position
                }
            });
        }
        return (
            <div className='dashboard-widget' key={component.id}>
                <div className='widget-header'>
                    <Button type='link' className='widget-drag-btn'>
                        <DragOutlined />
                    </Button>
                    <div className='widget-title' title={component.title?.toString()}>
                        {component.onRename ? (
                            <Typography.Paragraph
                                editable={{
                                    onChange: (value) => {
                                        if (value) {
                                            component.onRename!(value);
                                        }
                                    },
                                    triggerType: ['text']
                                }}
                            >
                                {component.title}
                            </Typography.Paragraph>
                        ) : (
                            <React.Fragment>{component.title}</React.Fragment>
                        )}
                    </div>
                    {component.onClose && (
                        <Button
                            type='link'
                            className='widget-close-btn'
                            onClick={() => {
                                setClosedWidgetsLayout((current) => {
                                    return {
                                        ...current,
                                        [component.id]: layout[component.id]
                                    };
                                });

                                component.onClose!();
                            }}
                        >
                            <CloseOutlined />
                        </Button>
                    )}
                </div>
                <div className='widget-content'>{component.content}</div>
            </div>
        );
    });

    useEffect(() => {
        setLayout((currentLayout) => {
            return getLayoutFromComponents(currentLayout);
        });

        setClosedWidgetsLayout((current) => {
            return {
                ...current,
                ...layout
            };
        });
    }, [props.components]);

    return (
        <div className='dashboard-pane' style={props.style}>
            {resizeListener}
            <GridLayout
                width={size.width || 100}
                autoSize={true}
                compactType={props.compactType}
                isBounded={false}
                preventCollision={props.preventCollision}
                cols={props.numCols}
                layout={Object.values(layout)}
                draggableHandle='.widget-drag-btn'
                onDragStop={(newLayout, oldItem, newItem) => {
                    updateTracker.evt = {
                        type: 'move',
                        item: newItem
                    };
                }}
                onResizeStop={(layout, oldItem, newItem) => {
                    updateTracker.evt = {
                        type: 'move',
                        item: newItem
                    };
                }}
                onLayoutChange={(updatedLayout) => {
                    const newLayout: Record<string, any> = {};
                    if (!props.compactType && !props.preventCollision) {
                        // custom compact logic that try to keep the widgets
                        // in their original positions if not affected by the new item positionn
                        if (updateTracker.evt) {
                            const updatedItem = updateTracker.evt.item;
                            setLayout((currentLayout) => {
                                updatedLayout.forEach((item) => {
                                    const prevItemState = currentLayout[item.i];
                                    if (updatedItem && prevItemState && item.i !== updatedItem.i) {
                                        //check if previous widget position intersects the new updated item position
                                        if (
                                            prevItemState.x < updatedItem.x + updatedItem.w &&
                                            prevItemState.x + prevItemState.w > updatedItem.x &&
                                            prevItemState.y < updatedItem.y + updatedItem.h &&
                                            prevItemState.y + prevItemState.h > updatedItem.y
                                        ) {
                                            let y = item.y;
                                            if (prevItemState.y < item.y) {
                                                // try to move it immediatly under the new item if the new y is greater than before
                                                y = updatedItem.y + updatedItem.h;
                                            }
                                            newLayout[item.i] = {
                                                ...item,
                                                y: y,
                                                moved: true
                                            };
                                        } else {
                                            // restore previous widget position if not overlapping with the new item position
                                            newLayout[item.i] = {
                                                ...prevItemState,
                                                moved: true
                                            };
                                        }
                                    } else {
                                        newLayout[item.i] = item;
                                    }
                                });

                                // try to avoid overflow (scrolling)
                                compactOverflowComponents(newLayout);

                                delete updateTracker.evt;
                                return newLayout;
                            });
                        }
                    } else {
                        updatedLayout.forEach((item) => {
                            newLayout[item.i] = item;
                        });
                        setLayout(newLayout);
                    }
                }}
                rowHeight={props.rowSnapHeight || 30}
            >
                {widgets}
            </GridLayout>
        </div>
    );
};
