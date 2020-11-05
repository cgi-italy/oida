import { MapView } from '@oida/state-mobx';

import { useMapModule } from './use-map-module';

export type MapNavControlsProps = {
    mapView: MapView;
    zoomFactor?: number
};

export const useMapNavControls = (props: MapNavControlsProps) => {

    const {mapView, zoomFactor} = props;

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


export const useMapNavControlsFromModule = (props: Omit<MapNavControlsProps, 'mapView'> = {}, mapModuleId?: string) => {
    let moduleState = useMapModule(mapModuleId);

    return useMapNavControls({
        mapView: moduleState.map.view,
        ...props
    });
};

