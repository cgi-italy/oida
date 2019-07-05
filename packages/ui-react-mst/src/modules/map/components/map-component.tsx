import React, { useEffect, useRef } from 'react';
import  classNames from 'classnames';

import { useObserver } from 'mobx-react-lite';

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
        if (mapContainer.current) {
            rendererController.setDomTarget(mapContainer.current);
        }

        return () => {
            rendererController.destroy();
        };
    }, [mapState]);

    useEffect(() => {
        if (rendererController)
            if (mapContainer.current) {
                rendererController.setDomTarget(mapContainer.current);
            }
    }, [mapContainer]);

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
