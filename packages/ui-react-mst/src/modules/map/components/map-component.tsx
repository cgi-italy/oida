import React, { useEffect, useRef } from 'react';
import  classNames from 'classnames';

import { useObserver } from 'mobx-react';

import { Omit } from '@oida/core';
import { IMap, MapRendererController } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';


export interface MapComponentProps {
    mapState: IMap;
    className?: string;
}

export const MapComponent = ({mapState, className}: MapComponentProps) => {

    const mapContainer = useRef<HTMLDivElement>(null);
    let rendererController: MapRendererController;

    useEffect(() => {
        rendererController = new MapRendererController({
            state: mapState
        });

        return () => {
            rendererController.destroy();
        };
    }, [mapState]);

    useEffect(() => {
        mapState.view.setDomTarget(mapContainer.current || undefined);

        return () => {
            mapState.view.setDomTarget(undefined);
        };
    }, [mapState, mapContainer]);

    return (
        <div
            className={classNames('map-widget', className)}
            ref={mapContainer}
        ></div>
    );
};

export const MapComponentFromModule = (props: Omit<MapComponentProps, 'mapState'>) => {

    let mapModuleState = useMapModuleState();

    let mapState = useObserver(() => {
        return mapModuleState.map;
    });

    return (
        <MapComponent mapState={mapState} {...props}></MapComponent>
    );
};
