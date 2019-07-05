import { Omit } from '@oida/core';
import { IMapView } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';


export type MapNavControlsProps = {
    mapView: IMapView;
    zoomFactor?: number
};

export const useMapNavControls = ({mapView, zoomFactor}: MapNavControlsProps) => {

    const zoom = zoomFactor || 2;

    const onZoomIn = () => {
        mapView.viewport.setResolution(
            mapView.viewport.resolution / zoom
        );
    };

    const onZoomOut = () => {
        mapView.viewport.setResolution(
            mapView.viewport.resolution * zoom
        );
    };

    return {
        onZoomIn: onZoomIn,
        onZoomOut: onZoomOut
    };
};


export const useMapNavControlsFromModule = (props: Omit<MapNavControlsProps, 'mapView'> = {}, mapModule?) => {
    let moduleState = useMapModuleState(mapModule);

    return useMapNavControls({
        mapView: moduleState.map.view,
        ...props
    });
};

