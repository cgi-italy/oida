import React from 'react';

import { Button, Tooltip } from 'antd';
import { PlusOutlined, MinusOutlined, ExpandOutlined } from '@ant-design/icons';

import { MapNavControlsProps } from '@oidajs/ui-react-core';

export type MapNavToolsProps = MapNavControlsProps & {
    size?: 'small' | 'middle' | 'large',
    showTooltips?: boolean;
};

export const MapNavTools = (props: MapNavToolsProps) => {

    return (
        <div className={'map-nav-tools'}>
            {props.onGoToHome &&
                <Tooltip
                        title={props.showTooltips ? 'Map home view' : ''}
                >
                    <Button className='home-ctrl' size={props.size} icon={<ExpandOutlined/>} onClick={props.onGoToHome}/>
                </Tooltip>
            }
            <div className='zoom-ctrls'>
                <Tooltip
                    title={props.showTooltips ? 'Zoom In' : ''}
                >
                    <Button className='zoom-ctrl' size={props.size} icon={<PlusOutlined/>} onClick={props.onZoomIn}/>
                </Tooltip>
                <Tooltip
                    title={props.showTooltips ? 'Zoom Out' : ''}
                >
                    <Button className='zoom-ctrl' size={props.size} icon={<MinusOutlined/>} onClick={props.onZoomOut} />
                </Tooltip>
            </div>
        </div>
    );
};

