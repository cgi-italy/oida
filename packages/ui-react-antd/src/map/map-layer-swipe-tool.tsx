import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import classnames from 'classnames';
import useDimensions from 'react-cool-dimensions';
import { createPortal } from 'react-dom';
import { Button } from 'antd';

import { MapLayerSwipeControlProps } from '@oidajs/ui-react-core';

export type MapLayerSwipeToolProps = MapLayerSwipeControlProps & {
    verticalMargin?: number;
    horizontalMargin?: number;
    targetName?: string;
    sourceName?: string;
};

export const MapLayerSwipeTool = (props: MapLayerSwipeToolProps) => {
    const { observe, width, height } = useDimensions();

    observe(props.mapTarget);

    const [verticalPos, setVerticalPos] = useState(height / 2);

    useEffect(() => {
        setVerticalPos(height / 2);
    }, [height]);

    const verticalMargin = props.verticalMargin || 50;
    const horizontalMargin = props.horizontalMargin || 5;

    const mapToolPortal = createPortal(
        <Draggable
            axis='x'
            position={{
                x: props.swipePosition * width,
                y: 0
            }}
            onDrag={(evt, dragData) => {
                let x = Math.max(dragData.x, horizontalMargin);
                x = Math.min(x, width - horizontalMargin);
                const position = x / width;
                props.onSwipePositionChange(position);
                setVerticalPos((current) => {
                    let y = current + dragData.deltaY;
                    y = Math.min(y, height - verticalMargin);
                    y = Math.max(y, verticalMargin);
                    return y;
                });
            }}
            disabled={!props.active}
        >
            <div className={classnames('map-swipe-tool', { 'is-disabled': !props.active })}>
                <Button className='map-swipe-tool-handle' type='primary' style={{ top: verticalPos }}>
                    ⋮
                </Button>
                {props.sourceName && <div className='map-swipe-tool-title map-swipe-tool-source-title'>{props.sourceName}</div>}
                {props.targetName && <div className='map-swipe-tool-title map-swipe-tool-target-title'>{props.targetName}</div>}
            </div>
        </Draggable>,
        props.mapTarget
    );

    return <React.Fragment>{mapToolPortal}</React.Fragment>;
};
