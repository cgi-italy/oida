import React from 'react';

import { Button, Tooltip } from 'antd';
import { PlusOutlined, MinusOutlined, HomeFilled } from '@ant-design/icons';

import { MapNavControlsProps } from '@oidajs/ui-react-core';

export type MapNavToolsProps = MapNavControlsProps & {
    size?: 'small' | 'middle' | 'large';
    showTooltips?: boolean;
};

export const MapNavTools = (props: MapNavToolsProps) => {
    return (
        <div className={'map-nav-tools'}>
            {props.onGoToHome && (
                <Tooltip title={props.showTooltips ? 'Map home view' : ''}>
                    <Button
                        className='home-ctrl'
                        aria-label='Map home viewport'
                        size={props.size}
                        icon={<HomeFilled />}
                        onClick={props.onGoToHome}
                    />
                </Tooltip>
            )}
            <div className='zoom-ctrls'>
                <Tooltip title={props.showTooltips ? 'Zoom In' : ''}>
                    <Button className='zoom-ctrl' aria-label='Zoom In' size={props.size} icon={<PlusOutlined />} onClick={props.onZoomIn} />
                </Tooltip>
                <Tooltip title={props.showTooltips ? 'Zoom Out' : ''}>
                    <Button
                        className='zoom-ctrl'
                        aria-label='Zoom Out'
                        size={props.size}
                        icon={<MinusOutlined />}
                        onClick={props.onZoomOut}
                    />
                </Tooltip>
            </div>
        </div>
    );
};
