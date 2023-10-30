import React from 'react';
import classnames from 'classnames';
import { Button, Card, CardProps } from 'antd';
import { RightOutlined } from '@ant-design/icons';

export type CardLinkProps = {
    layout: 'horizontal' | 'vertical';
    title: React.ReactNode;
    content: React.ReactNode;
    linkText?: string;
    onLinkClick?: () => void;
} & Omit<CardProps, 'content'>;

export const CardLink = (props: CardLinkProps) => {
    const { layout, title, content, linkText, onLinkClick, className, ...cardProps } = props;
    return (
        <Card className={classnames('card-link', `card-link-${props.layout}`, className)} {...cardProps}>
            <div className='card-link-body'>
                <div className='card-link-title'>{title}</div>
                <div className='card-link-content'>{content}</div>
            </div>
            {linkText && (
                <div className='card-link-action'>
                    <Button type='link' block onClick={onLinkClick}>
                        <span>{linkText}</span>
                        <RightOutlined />
                    </Button>
                </div>
            )}
        </Card>
    );
};
