import React, { useRef } from 'react';
import useResizeAware from 'react-resize-aware';

export const ScrollableOverlay = (props) => {

    const [resizeListener, size] = useResizeAware();
    const scrollableContentRef = useRef<HTMLDivElement>(null);

    return (
        <div className='scrollable-overlay'>
            <div className='scrollable-overlay-content-wrapper' ref={scrollableContentRef}>
                <div className='scrollable-overlay-content' >
                    {resizeListener}
                    {props.children}
                </div>
            </div>
            <div className='scrollable-overlay-scroller' onScroll={(evt) => {
                if (scrollableContentRef.current) {
                    scrollableContentRef.current.scrollTop = evt.currentTarget.scrollTop;
                }
            }}>
                <div className='scrollable-overlay-scroller-overflow' style={{height: size.height}}/>
            </div>
        </div>
    );
};
