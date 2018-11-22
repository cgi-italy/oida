import * as React from 'react';

import { MapRendererController } from '@oida/state-mst';

export interface MapComponentProps {
    rendererController: MapRendererController;
}

export class MapComponent extends React.Component<MapComponentProps> {

    private mapContainer_: HTMLElement;

    constructor(props: MapComponentProps) {
        super(props);
    }

    componentDidMount() {
        this.props.rendererController.setDomTarget(this.mapContainer_);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        this.props.rendererController.setDomTarget(null);
    }

    render() {
        return (
            <div
                className='map-widget'
                style={{ width: '100%', height: '100%' }}
                ref={(element) => this.mapContainer_ = element}
            ></div>
        );
    }
}
