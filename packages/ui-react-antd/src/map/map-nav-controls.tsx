import React from 'react';

import { Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

import { MapNavControlsProps } from '@oida/ui-react-core';

export const MapNavControls = (props: MapNavControlsProps) => {

    return (
        <div className={'map-nav-controls'}>
            <Button className='zoom-ctrl' size='small' icon={<PlusOutlined/>} onClick={props.onZoomIn}/>
            <Button className='zoom-ctrl' size='small' icon={<MinusOutlined/>} onClick={props.onZoomOut} />
        </div>
    );
};

