import React from 'react';

import { Tag, Button } from 'antd';

import { AoiField, AOI_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

export type AoiFieldRendererProps = {

};

export class AoiFieldRenderer extends React.Component<AoiField & AoiFieldRendererProps> {

    onAoiChange(value) {
        this.props.onChange(value);
    }

    render() {

        let { value, onChange, config, ...renderProps } = this.props;
        let { onDrawBBoxAction, onDrawPolygonAction, onHoverAction, onSelectAction, color } = config;
         return (
            <Button.Group>
                {value &&
                <Tag
                    closable
                    color={color}
                    onMouseOver={() => onHoverAction(true)}
                    onMouseOut={() => onHoverAction(false)}
                    onClick={() => onSelectAction(true)}
                    onClose={this.onAoiChange.bind(this, null)}>{this.props.value.name}</Tag>
                }
                <Button size='small' onClick={() => onDrawBBoxAction()}>B</Button>
                <Button size='small' onClick={() => onDrawPolygonAction()}>P</Button>
            </Button.Group>
        );
    }
}

antdFormFieldRendererFactory.register<AoiField>(
    AOI_FIELD_ID, 'aoi',
    (props) => <AoiFieldRenderer {...props}></AoiFieldRenderer>
);
