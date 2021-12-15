
import { useState, useEffect } from 'react';

import { autorun } from 'mobx';
import debounce from 'lodash/debounce';

import { BBox } from '@oidajs/core';
import { Map } from '@oidajs/state-mobx';
import { useMapModule } from './use-map-module';

export type MapViewportProps = {
    map: Map;
    debounce?: number;
};

export const useMapViewport = (props: MapViewportProps) => {

    let [ viewportExtent, setViewportExtent ] = useState<BBox>();

    let debouncedSetViewport = debounce((viewport) => {
        setViewportExtent(props.map.renderer.implementation!.getViewportExtent());
    }, props.debounce);

    useEffect(() => {
        let disposeViewportObserver = autorun(() => {
            let renderer = props.map.renderer.implementation;
            let viewport = props.map.view.viewport;

            if (renderer) {
                debouncedSetViewport(viewport);
            }
        });

        return () => {
            disposeViewportObserver();
        };
    }, []);

    return viewportExtent;
};

export const useMapViewportFromModule = (props: Omit<MapViewportProps, 'map'> = {}, mapModuleid?: string) => {
    let mapModuleState = useMapModule(mapModuleid);
    return useMapViewport({
        map: mapModuleState.map,
        ...props
    });
};

