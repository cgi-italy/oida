import React, { useRef, useEffect } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';

export type useScrollIntoViewProps = {
    scrollToElement: boolean;
    element: Element | null | undefined;
};

export const useScrollIntoView = (props: useScrollIntoViewProps) => {
    useEffect(() => {
        if (props.scrollToElement && props.element) {
            scrollIntoView(props.element, {
                scrollMode: 'if-needed'
            });
        }
    }, [props.element, props.scrollToElement]);
};

export type canBeScrolledIntoViewProps = {
    scrollToItem: boolean;
    children: React.ReactNode;
};

export const CanBeScrolledIntoView = (props: canBeScrolledIntoViewProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useScrollIntoView({
        element: wrapperRef.current,
        scrollToElement: props.scrollToItem
    });

    return <div ref={wrapperRef}>{props.children}</div>;
};
