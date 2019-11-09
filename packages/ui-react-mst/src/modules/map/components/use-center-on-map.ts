import React, { useEffect, useRef } from 'react';

import { useObserver } from 'mobx-react-lite';

import { Geometry, centerOnMap, CenterOnMapOptions, IMapRenderer } from '@oida/core';
import { IMap } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';

export type CenterOnMapProps = {
    map: IMap
};

export const useCenterOnMap = (props: CenterOnMapProps) => {

    let pendingRequest = useRef<(renderer: IMapRenderer) => void>();

    let renderer = useObserver(() => {
        return props.map.renderer.implementation;
    });

    useEffect(() => {
        if (renderer && pendingRequest.current) {
            pendingRequest.current(renderer);
            pendingRequest.current = undefined;
        }
    }, [renderer]);


    return (geometry: Geometry, options?: CenterOnMapOptions) => {
        if (renderer) {
            centerOnMap(renderer, geometry, options);
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

export const useCenterOnMapFromModule = (mapModule?) => {
    let mapModuleState = useMapModuleState(mapModule);
    return useCenterOnMap({
        map: mapModuleState.map
    });
};
