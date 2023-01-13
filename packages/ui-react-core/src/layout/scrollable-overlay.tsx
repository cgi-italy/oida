import React, { useRef } from 'react';
import useDimensions from 'react-cool-dimensions';
import classnames from 'classnames';

export type ScrollableOverlayProps = {
    className?: string;
    children?: React.ReactNode;
};

export const ScrollableOverlay = (props: ScrollableOverlayProps) => {
    const { observe, height } = useDimensions();
    const scrollableContentRef = useRef<HTMLDivElement>(null);

    const childrenWithContainerHeight = React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
            //make children aware of the container visible height
            return React.cloneElement<{ containerHeight: number }>(child as React.ReactElement, {
                containerHeight: scrollableContentRef.current?.clientHeight
            });
        }
        return child;
    });

    return (
        <div className={classnames('scrollable-overlay', props.className)}>
            <div className='scrollable-overlay-content-wrapper' ref={scrollableContentRef}>
                <div className='scrollable-overlay-content' ref={observe}>
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
                <div className='scrollable-overlay-scroller-overflow' style={{ height: height || 0 }} />
            </div>
        </div>
    );
};
