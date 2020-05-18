
import React, { useState, useEffect } from 'react';

import { autorun } from 'mobx';
import debounce from 'lodash/debounce';

import { BBox } from '@oida/core';
import { IMap } from '@oida/state-mst';

export type MapViewportProps = {
    map: IMap;
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
