import React from 'react';
import { Button, Carousel, Empty, Spin } from 'antd';
import { LeftOutlined, RightOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import classnames from 'classnames';

import { ContentPageSection } from '@oidajs/ui-react-core';

import { CardLink, CardLinkProps } from './card-link';

const CarouselIcon = (props) => {
    const { currentSlide, slideCount, ...remainingProps } = props;
    return <span {...remainingProps}></span>;
};

export type CardLinksSectionProps = {
    title: React.ReactNode;
    cards: CardLinkProps[];
    moreLink?: {
        onClick: () => void;
        text?: React.ReactNode;
    };
    carousel?: boolean;
    columns?: number;
    className?: string;
    loading?: boolean;
    error?: string;
};

export const CardLinksSection = (props: CardLinksSectionProps) => {
    const cardLinks = props.cards.map((cardProps, idx) => {
        return <CardLink key={idx} {...cardProps} />;
    });

    let cardSection: JSX.Element;
    const columns = props.columns || 3;
    if (props.carousel && cardLinks.length > columns) {
        const carouselPages: JSX.Element[] = [];
        for (let i = 0; i < cardLinks.length; i += columns) {
            carouselPages.push(
                <div key={i}>
                    <div className='card-links-section-cards'>{cardLinks.slice(i, i + columns)}</div>
                </div>
            );
        }
        cardSection = (
            <Carousel
                arrows
                dots={true}
                prevArrow={
                    <CarouselIcon>
                        <LeftOutlined />
                    </CarouselIcon>
                }
                nextArrow={
                    <CarouselIcon>
                        <RightOutlined />
                    </CarouselIcon>
                }
            >
                {carouselPages}
            </Carousel>
        );
    } else {
        cardSection = <div className='card-links-section-cards'>{cardLinks}</div>;
    }

    return (
        <ContentPageSection className={classnames('card-links-section', props.className)}>
            <div className='card-links-section-wrapper'>
                <h4>{props.title}</h4>
                {props.moreLink && (
                    <Button className='card-links-section-more-btn' type='link' onClick={props.moreLink.onClick}>
                        {props.moreLink.text || 'See all'}
                        <RightOutlined />
                    </Button>
                )}
                <Spin spinning={props.loading ? true : false} size='large' indicator={<LoadingOutlined />}>
                    {!props.error && cardSection}
                    {props.error && (
                        <Empty
                            image={<CloseCircleOutlined />}
                            description={props.error}
                            imageStyle={{ fontSize: '30px', height: '40px' }}
                        />
                    )}
                </Spin>
            </div>
        </ContentPageSection>
    );
};
