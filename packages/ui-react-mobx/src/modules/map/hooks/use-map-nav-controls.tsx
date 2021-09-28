import { MapView, MapViewportProps } from '@oida/state-mobx';
import { MapNavControlsProps } from '@oida/ui-react-core';

import { useMapModule } from './use-map-module';

export type UseMapNavControlsProps = {
    mapView: MapView;
    zoomFactor?: number;
    homeViewport?: MapViewportProps;
};

export const useMapNavControls = (props: UseMapNavControlsProps) => {

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

    const homeViewport = props.homeViewport;
    const onGoToHome = homeViewport ? () => {
        mapView.setViewport(homeViewport);
    } : undefined;

    const mapNavProps: MapNavControlsProps = {
        onZoomIn: onZoomIn,
        onZoomOut: onZoomOut,
        onGoToHome: onGoToHome
    };

    return mapNavProps;
};


export const useMapNavControlsFromModule = (props: Omit<UseMapNavControlsProps, 'mapView'> = {}, mapModuleId?: string) => {
    let moduleState = useMapModule(mapModuleId);

    return useMapNavControls({
        mapView: moduleState.map.view,
        homeViewport: moduleState.config.initialOptions?.viewport,
        ...props
    });
};

