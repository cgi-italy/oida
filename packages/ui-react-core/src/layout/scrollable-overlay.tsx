import React, { useRef } from 'react';
import useResizeAware from 'react-resize-aware';
import classnames from 'classnames';

export type ScrollableOverlayProps = {
    className?: string;
    children?: React.ReactNode;
};

export const ScrollableOverlay = (props: ScrollableOverlayProps) => {
    const [resizeListener, size] = useResizeAware();
    const scrollableContentRef = useRef<HTMLDivElement>(null);

    const childrenWithContainerHeight = React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
            //make children aware of the container visible height
            return React.cloneElement(child, { containerHeight: scrollableContentRef.current?.clientHeight });
        }
        return child;
    });

    return (
        <div className={classnames('scrollable-overlay', props.className)}>
            <div className='scrollable-overlay-content-wrapper' ref={scrollableContentRef}>
                <div className='scrollable-overlay-content'>
                    {resizeListener}
                    {childrenWithContainerHeight}
                </div>
            </div>
            <div
                className='scrollable-overlay-scroller'
                onScroll={(evt) => {
                    if (scrollableContentRef.current) {
                        scrollableContentRef.current.scrollTop = evt.currentTarget.scrollTop;
                    }
                }}
            >
                <div className='scrollable-overlay-scroller-overflow' style={{ height: size.height || 0 }} />
            </div>
        </div>
    );
};
