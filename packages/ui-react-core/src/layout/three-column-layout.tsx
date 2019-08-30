import React from 'react';

import classnames from 'classnames';

export type ThreeColumnLayoutProps = {
    header?: React.ReactNode;
    left?: React.ReactNode;
    right?: React.ReactNode;
    main?: React.ReactNode;
    bottom?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

export const ThreeColumnLayout = (props: ThreeColumnLayoutProps) => {
    return (
        <div className={classnames('three-col-layout', props.className)} style={props.style}>
            <header className='layout-header'>{props.header}</header>
            <section className='layout-content'>
                <section className='layout-left'>{props.left}</section>
                <section className='layout-main'>{props.main}</section>
                <section className='layout-right'>{props.right}</section>
            </section>
            <footer className='layout-bottom'>{props.bottom}</footer>
        </div>
    );
};
