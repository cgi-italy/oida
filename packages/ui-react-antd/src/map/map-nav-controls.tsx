import React from 'react';

import { Button } from 'antd';

import { MapNavControlsProps } from '@oida/ui-react-core';

export class MapNavControls extends React.Component<MapNavControlsProps> {

    onZoomInClick() {
        this.props.onZoomIn();
    }

    onZoomOutClick() {
        this.props.onZoomOut();
    }

    render() {

        return (
            <div className={'map-nav-controls'}>
                <Button className='zoom-ctrl' size='small' icon='plus' onClick={this.onZoomInClick.bind(this)}/>
                <Button className='zoom-ctrl' size='small' icon='minus' onClick={this.onZoomOutClick.bind(this)} />
            </div>
        );
    }
}
