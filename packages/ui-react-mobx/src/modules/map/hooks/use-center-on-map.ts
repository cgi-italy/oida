import { useEffect, useRef } from 'react';

import { Geometry, centerOnMap, CenterOnMapOptions, IMapRenderer } from '@oidajs/core';
import { Map } from '@oidajs/state-mobx';

import { useSelector } from '../../../core';
import { useMapModule } from './use-map-module';


export type CenterOnMapProps = {
    map: Map
};

export const useCenterOnMap = (props: CenterOnMapProps) => {

    const pendingRequest = useRef<(renderer: IMapRenderer) => void>();

    const renderer = useSelector(() => {
        return props.map.renderer.implementation;
    });

    useEffect(() => {
        if (renderer && pendingRequest.current) {
            pendingRequest.current(renderer);
            pendingRequest.current = undefined;
        }
    }, [renderer]);

    return (geometry: Geometry, options?: CenterOnMapOptions) => {
        if (props.map.renderer.implementation) {
            centerOnMap(props.map.renderer.implementation, geometry, options);
        } else {
            pendingRequest.current = (renderer) => {
                centerOnMap(renderer, geometry, {
                    ...options,
                    animate: false
                });
            };
        }
    };
};

export const useCenterOnMapFromModule = (mapModuleId?: string) => {
    let mapModuleState = useMapModule(mapModuleId);
    return useCenterOnMap({
        map: mapModuleState.map
    });
};
