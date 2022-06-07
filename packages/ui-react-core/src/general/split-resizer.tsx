import React, { useState } from 'react';
import Draggable from 'react-draggable';
import classnames from 'classnames';

export type SplitResizerProps = {
    origin: 'left' | 'right' | 'bottom' | 'top';
    initialSize: number;
    onResize: (newSize: number) => void;
    minSize?: number;
    className?: string;
};

export const SplitResizer = (props: SplitResizerProps) => {
    const isHorizontal = props.origin === 'left' || props.origin === 'right';

    const [resizeState, setResizeState] = useState({
        resizing: false,
        size: props.initialSize
    });

    const ghostStyle = isHorizontal
        ? {
              width: resizeState.size
          }
        : {
              height: resizeState.size
          };

    const getDragPosition = () => {
        if (props.origin === 'left') {
            return {
                x: resizeState.size,
                y: 0
            };
        } else if (props.origin === 'right') {
            return {
                x: -resizeState.size,
                y: 0
            };
        } else if (props.origin === 'top') {
            return {
                x: 0,
                y: resizeState.size
            };
        } else if (props.origin === 'bottom') {
            return {
                x: 0,
                y: -resizeState.size
            };
        }
    };

    const getDragSize = (dragData) => {
        let size = 0;
        if (props.origin === 'left') {
            size = dragData.x;
        } else if (props.origin === 'right') {
            size = -dragData.x;
        } else if (props.origin === 'top') {
            size = dragData.y;
        } else if (props.origin === 'bottom') {
            size = -dragData.y;
        }
        return Math.max(size, props.minSize || 0);
    };

    return (
        <div className={classnames('split-resizer', props.className, `is-${props.origin}`, { 'is-resizing': resizeState.resizing })}>
            <div style={ghostStyle} className={classnames('split-resizer-ghost')} />
            <Draggable
                axis={isHorizontal ? 'x' : 'y'}
                position={getDragPosition()}
                onStart={() =>
                    setResizeState({
                        resizing: true,
                        size: resizeState.size
                    })
                }
                onDrag={(evt, data) => {
                    setResizeState({
                        resizing: true,
                        size: getDragSize(data)
                    });
                }}
                onStop={(evt, data) => {
                    const size = getDragSize(data);
                    setResizeState({
                        resizing: false,
                        size: size
                    });
                    props.onResize(size);
                }}
            >
                <div className={classnames('split-resizer-handler', { 'is-resizing': resizeState.resizing })}></div>
            </Draggable>
        </div>
    );
};
