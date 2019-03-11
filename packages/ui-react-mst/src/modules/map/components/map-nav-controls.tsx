import React from 'react';
import { observer } from 'mobx-react';

import { IMapView } from '@oida/state-mst';
import { MapNavControlsRenderer } from '@oida/ui-react-core';

import { MAP_MODULE_DEFAULT_ID } from '../map-module';
import { inject } from '../../../utils/inject';

export type MapNavControlsProps = {
    mapView: IMapView;
    zoomFactor?: number
    render: MapNavControlsRenderer;
};

class MapNavControlsBase extends React.Component<MapNavControlsProps> {

    static defaultProps = {
        zoomFactor: 2
    };

    onZoomIn() {
        this.props.mapView.viewport.setResolution(
            this.props.mapView.viewport.resolution / this.props.zoomFactor
        );
    }

    onZoomOut() {
        this.props.mapView.viewport.setResolution(
            this.props.mapView.viewport.resolution * this.props.zoomFactor
        );
    }

    render() {

        let { render, mapView } = this.props;

        return render({
            onZoomIn: this.onZoomIn.bind(this),
            onZoomOut: this.onZoomOut.bind(this)
        });
    }
}

export const MapNavControls = observer(MapNavControlsBase);

export const MapNavControlsS = inject(({appState}) => {
    return {
        mapView: appState[MAP_MODULE_DEFAULT_ID].map.view
    };
})(MapNavControls);
