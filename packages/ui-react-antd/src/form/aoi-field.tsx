import React from 'react';

import { Tag, Button, Tooltip } from 'antd';

import { AoiField, AoiAction, AOI_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

import { DrawBboxIcon } from '../icons/draw-bbox';
import { DrawPolygonIcon } from '../icons/draw-polygon';

export type AoiFieldRendererProps = {

};

export class AoiFieldRenderer extends React.Component<AoiField & AoiFieldRendererProps> {

    onAoiChange(value) {
        this.props.onChange(value);
    }

    render() {

        let { value, onChange, config, ...renderProps } = this.props;
        let { onDrawBBoxAction, onDrawPolygonAction, onHoverAction, onSelectAction, activeAction, color } = config;
         return (
            <React.Fragment>
                {value &&
                <Tag
                    closable
                    color={color}
                    onMouseOver={onHoverAction ? () => onHoverAction!(true) : undefined}
                    onMouseOut={onHoverAction ? () => onHoverAction!(false) : undefined}
                    onClick={onSelectAction ? () => onSelectAction!(true) : undefined}
                    onClose={this.onAoiChange.bind(this, null)}>{value.name}</Tag>
                }
                {!value &&
                <Tag
                    color='#dddddd'
                >No area specified</Tag>
                }
                <Button.Group>
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
                </Button.Group>
            </React.Fragment>
        );
    }
}

antdFormFieldRendererFactory.register<AoiField>(
    AOI_FIELD_ID, 'aoi',
    (props) => <AoiFieldRenderer {...props}></AoiFieldRenderer>
);
