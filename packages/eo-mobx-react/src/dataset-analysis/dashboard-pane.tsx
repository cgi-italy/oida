import React, { useState, useEffect } from 'react';

import { Responsive } from 'react-grid-layout';
import useResizeAware from 'react-resize-aware';

import { Button } from 'antd';
import { DragOutlined, CloseOutlined } from '@ant-design/icons';

import { LayoutSectionProps } from '@oida/ui-react-core';

import 'react-grid-layout/css/styles.css';

export type DashboardGridBreakpoint = {
    width: number;
    numColumns: number;
};

export type DashboardPaneProps =  LayoutSectionProps & {
    gridBreakpoints: DashboardGridBreakpoint[],
    rowSnapHeight?: number,
    style?: React.CSSProperties;
};


export const DashboardPane = (props: DashboardPaneProps) => {

    const [resizeListener, size] = useResizeAware();
    const [layouts, setLayouts] = useState({});

    let cols = {};
    let breakpoints = {};
    let gridLayouts = {};

    let hasLayouts = true;

    props.gridBreakpoints.forEach((breakpoint, idx) => {
        let id = `bp${idx}`;
        cols[id] = breakpoint.numColumns;
        breakpoints[id] = breakpoint.width;
        if (layouts[id]) {
            gridLayouts[id] = Object.keys(layouts[id]).map(widgetId => layouts[id][widgetId]);
        } else {
            hasLayouts = false;
        }
    });

    useEffect(() => {

        let updatedLayouts = {};

        props.components.forEach((component) => {
            for (let breakpoint in breakpoints) {
                let prevLayout = layouts[breakpoint];
                updatedLayouts[breakpoint] = updatedLayouts[breakpoint] || {};
                if (prevLayout && prevLayout[component.id]) {
                    updatedLayouts[breakpoint][component.id] = prevLayout[component.id];
                } else {
                    updatedLayouts[breakpoint][component.id] = {
                        i: component.id,
                        x: 0,
                        y: Infinity,
                        w: cols[breakpoint],
                        h: 8
                    };
                }
            }
        });

        setLayouts(updatedLayouts);

    }, [props.components]);

    if (!hasLayouts) {
        return null;
    }

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
            <Responsive
                width={size.width || 100}
                compactType={'vertical'}
                preventCollision={false}
                breakpoints={breakpoints}
                cols={cols}
                layouts={gridLayouts}
                draggableHandle='.widget-drag-btn'
                onLayoutChange={(currentLayout, allLayouts) => {
                    let newLayouts = {};
                    for (let breakpoint in allLayouts) {
                        newLayouts[breakpoint] = {};
                        allLayouts[breakpoint].forEach((item) => {
                            newLayouts[breakpoint][item.i] = item;
                        });
                    }
                    setLayouts(newLayouts);
                }}
                rowHeight={props.rowSnapHeight || 30}
            >
                {widgets}
            </Responsive>
        </div>
    );
};
