import React, { useEffect, useRef } from 'react';
import  classNames from 'classnames';

import { useObserver } from 'mobx-react';

import { IMap, MapRendererController } from '@oida/state-mst';
import useResizeAware from 'react-resize-aware';

import { useMapModuleState } from '../use-map-module-state';


export interface MapComponentProps {
    mapState: IMap;
    className?: string;
    style?: React.CSSProperties;
}

export const MapComponent = ({mapState, className, style}: MapComponentProps) => {

    const [resizeListener, size] = useResizeAware();

    const mapContainer = useRef<HTMLDivElement>(null);
    let rendererController: MapRendererController;


    useEffect(() => {

        if (size && size.width && size.height) {
            mapState.view.setDomTarget(mapContainer.current || undefined);
        } else {
            mapState.view.setDomTarget(undefined);
        }

        return () => {
            mapState.view.setDomTarget(undefined);
        };

    }, [mapState, mapContainer]);

    useEffect(() => {
        rendererController = new MapRendererController({
            state: mapState
        });

        return () => {
            rendererController.destroy();
        };
    }, [mapState]);

    useEffect(() => {
        if (size && size.width && size.height) {
            if (!mapState.view.target) {
                mapState.view.setDomTarget(mapContainer.current || undefined);
            } else {
                mapState.renderer.implementation?.updateSize();
            }
        } else {
            mapState.view.setDomTarget(undefined);
        }
    }, [size]);

    return (
        <div
            className={classNames('map-widget', className)}
            style={style}
            ref={mapContainer}
        >
            {resizeListener}
        </div>
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
