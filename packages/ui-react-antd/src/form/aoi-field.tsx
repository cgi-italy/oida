import React from 'react';

import { Tag, Button, Tooltip, Icon } from 'antd';

import { AoiField, AoiAction, AOI_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

import { DrawBboxIcon } from '../icons/draw-bbox';
import { DrawPolygonIcon } from '../icons/draw-polygon';

export const AoiFieldRenderer = (props:  Omit<AoiField, 'name' | 'type'>) => {

    let { value, onChange, config, ...renderProps } = props;
    let { onDrawPointAction, onDrawBBoxAction, onDrawPolygonAction, onLinkToViewportAction,
         onHoverAction, onSelectAction, activeAction, color, name } = config;

    return (
        <React.Fragment>
            {value &&
            <Tag
                closable
                color={color}
                onMouseOver={onHoverAction ? () => onHoverAction!(true) : undefined}
                onMouseOut={onHoverAction ? () => onHoverAction!(false) : undefined}
                onClick={onSelectAction ? () => onSelectAction!(true) : undefined}
                onClose={(evt) => {
                    evt.stopPropagation();
                    if (activeAction === AoiAction.LinkToViewport) {
                        if (onLinkToViewportAction) {
                            onLinkToViewportAction();
                        }
                    } else {
                        props.onChange(undefined);
                    }
                }}
            >
                {name}
            </Tag>
            }
            {!value &&
            <Tag
                color='#dddddd'
            >No area specified</Tag>
            }
            <Button.Group>
                {
                    onDrawPointAction &&
                    <Tooltip
                        title='Select coordinate'
                    >
                        <Button
                            type={activeAction === AoiAction.DrawPoint ? 'primary' : 'default'}
                            size='small'
                            onClick={() => onDrawPointAction!()}
                        >
                            <Icon type='environment'/>
                        </Button>
                    </Tooltip>
                }
                {
                    onDrawBBoxAction &&
                    <Tooltip
                        title='Draw bbox'
                    >
                        <Button
                            type={activeAction === AoiAction.DrawBBox ? 'primary' : 'default'}
                            size='small'
                            onClick={() => onDrawBBoxAction!()}
                        >
                            <DrawBboxIcon/>
                        </Button>
                    </Tooltip>
                }
                {
                    onDrawPolygonAction &&
                    <Tooltip
                        title='Draw polygon'
                    >
                        <Button
                            type={activeAction === AoiAction.DrawPolygon ? 'primary' : 'default'}
                            size='small'
                            onClick={() => onDrawPolygonAction!()}
                        >
                            <DrawPolygonIcon/>
                        </Button>
                    </Tooltip>
                }
                {
                    onLinkToViewportAction &&
                    <Tooltip
                        title='Link to viewport'
                    >
                        <Button
                            type={activeAction === AoiAction.LinkToViewport ? 'primary' : 'default'}
                            size='small'
                            onClick={() => onLinkToViewportAction!()}
                        >
                            <Icon type='link'/>
                        </Button>
                    </Tooltip>
                }
            </Button.Group>
        </React.Fragment>
    );
};

antdFormFieldRendererFactory.register<AoiField>(
    AOI_FIELD_ID, 'aoi',
    AoiFieldRenderer
);
