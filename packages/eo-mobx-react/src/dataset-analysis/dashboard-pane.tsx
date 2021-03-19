import React, { useState, useEffect } from 'react';

import GridLayout from 'react-grid-layout';
import useResizeAware from 'react-resize-aware';

import { Button } from 'antd';
import { DragOutlined, CloseOutlined } from '@ant-design/icons';

import { LayoutSectionProps } from '@oida/ui-react-core';

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
    /** number of dashboard snap columns*/
    numCols: number;
    /** dashboard snap row height*/
    rowSnapHeight?: number;
    /** widget compacting method */
    compactType?: 'vertical' | 'horizontal' | null;
    /** prevent collisions between widgets */
    preventCollision?: boolean;
    /** dashboard style */
    style?: React.CSSProperties;
    /** default position of newly added components */
    defaultWidgetPosition?: DashboardItemPosition;
};

/**
 * A layout section container that display the child components as dashboard widgets
 * It uses [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout) under the hood
 *
 * @param props the component properties
 */
export const DashboardPane = (props: LayoutSectionProps & DashboardPaneProps) => {

    const [layout, setLayout] = useState({});
    const [resizeListener, size] = useResizeAware();

    useEffect(() => {

        let updatedLayout = {};
        props.components.forEach((component) => {

            if (layout && layout[component.id]) {
                updatedLayout[component.id] = layout[component.id];
            } else {
                const position = props.defaultWidgetPosition || {
                    x: 0,
                    y: 0,
                    w: props.numCols,
                    h: 8
                };
                updatedLayout[component.id] = {
                    i: component.id,
                    ...position
                };
            }
        });

        setLayout(updatedLayout);

    }, [props.components]);

    let widgets = props.components.map((component) => {
        return (
            <div className='dashboard-widget' key={component.id}>
                <div className='widget-header'>
                    <Button
                        type='link'
                        className='widget-drag-btn'
                    >
                        <DragOutlined/>
                    </Button>
                    {component.title}
                    {component.onClose &&
                        <Button
                            type='link'
                            className='widget-close-btn'
                            onClick={() => component.onClose!()}
                        >
                            <CloseOutlined/>
                        </Button>
                    }
                </div>
                <div className='widget-content'>
                    {component.content}
                </div>
            </div>
        );
    });

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
                onLayoutChange={(layout) => {
                    const updateLayout = layout.reduce((updatedLayout, item) => {
                        return {
                            ...updatedLayout,
                            [item.i]: item
                        };
                    }, {});
                    setLayout(updateLayout);
                }}
                rowHeight={props.rowSnapHeight || 30}
            >
                {widgets}
            </GridLayout>
        </div>
    );
};
