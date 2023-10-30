import React from 'react';

export type PageHeaderProps = {
    title: React.ReactNode;
    subTitle?: React.ReactNode;
    children?: React.ReactNode;
};

export const PageHeader = (props: PageHeaderProps) => {
    return (
        <div className='page-header'>
            <div className='page-header-title-bar'>
                <div className='page-header-title'>{props.title}</div>
                {props.subTitle && <div className='page-header-subtitle'>{props.subTitle}</div>}
            </div>
            {props.children && <div className='page-header-footer'>{props.children}</div>}
        </div>
    );
};
