import { useEffect } from 'react';

import { AoiAction, FormFieldState, AoiValue } from '@oida/core';
import { useAoiModuleState } from '../use-aoi-module-state';
import { IMap } from '@oida/state-mst';

export type MapAoiViewportProps = {
    map: IMap;
    activeAction: AoiAction,
    onActiveActionChange: (action: AoiAction) => void
} & FormFieldState<AoiValue>;

export const useMapAoiViewport = (props: MapAoiViewportProps) => {

    useEffect(() => {
        if (props.value?.props?.fromMapViewport) {
            if (props.activeAction !== AoiAction.LinkToMapViewport) {
                props.onActiveActionChange(AoiAction.LinkToMapViewport);
            }
        } else {
            if (props.activeAction === AoiAction.LinkToMapViewport) {
                props.onActiveActionChange(AoiAction.None);
            }
        }
    }, [props.value]);

    useEffect(() => {
        if (props.activeAction === AoiAction.LinkToMapViewport) {
            if (!props.value?.props?.fromMapViewport) {
                let bbox = props.map.renderer.implementation!.getViewportExtent();
                props.onChange({
                    geometry: {
                        type: 'BBox',
                        bbox: bbox
                    },
                    props: {
                        fromMapViewport: true
                    }
                });
            }
        } else {
            if (props.value?.props?.fromMapViewport && props.activeAction !== AoiAction.None) {
                props.onChange(undefined);
            }
        }
    }, [props.activeAction]);

    if (props.value?.props?.fromMapViewport) {
        return {
            name: 'Current map viewport'
        };
    }
};

export const useMapAoiViewportFromModule = (props: Omit<MapAoiViewportProps, 'map'>, aoiModule?) => {
    let moduleState = useAoiModuleState(aoiModule);

    return useMapAoiViewport({
        map: moduleState.map,
        ...props
    });
};
