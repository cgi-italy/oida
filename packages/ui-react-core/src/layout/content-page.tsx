import React from 'react';
import classnames from 'classnames';

export type ContentPageProps = {
    children: React.ReactNode;
};

export const ContentPage = (props: ContentPageProps) => {
    return <div className='content-page'>{props.children}</div>;
};

export type ContentPageSectionProps = {
    children: React.ReactNode;
    className?: string;
};

export const ContentPageSection = (props: ContentPageSectionProps) => {
    return (
        <div className={classnames('content-page-section', props.className)}>
            <div className='content-page-section-wrapper'>{props.children}</div>
        </div>
    );
};
