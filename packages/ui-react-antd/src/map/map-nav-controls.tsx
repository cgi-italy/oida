import React from 'react';

import { Button } from 'antd';

import { MapNavControlsProps } from '@oida/ui-react-core';

export const MapNavControls = (props: MapNavControlsProps) => {

    return (
        <div className={'map-nav-controls'}>
            <Button className='zoom-ctrl' size='small' icon='plus' onClick={props.onZoomIn}/>
            <Button className='zoom-ctrl' size='small' icon='minus' onClick={props.onZoomOut} />
        </div>
    );
};

