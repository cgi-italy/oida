import { useEffect } from 'react';

import { AoiAction, FormFieldState, AoiValue } from '@oidajs/core';
import { Map } from '@oidajs/state-mobx';

import { useAoiModule } from './use-aoi-module';

export type MapAoiViewportProps = {
    map: Map;
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
                let bbox = props.map.renderer.implementation?.getViewportExtent();
                if (bbox) {
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

export const useMapAoiViewportFromModule = (props: Omit<MapAoiViewportProps, 'map'>, aoiModuleId?: string) => {
    let moduleState = useAoiModule(aoiModuleId);

    return useMapAoiViewport({
        map: moduleState.mapModule.map,
        ...props
    });
};
