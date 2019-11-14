import { useObserver } from 'mobx-react';

import { IMap } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';

export type MapRendererItem = {
    id: string;
    name: string;
};

export type MapRendererSelectorProps = {
    renderers: MapRendererItem[],
    map: IMap
};

export const useMapRendererSelector = ({map, renderers}: MapRendererSelectorProps) => {
    return useObserver(() => ({
        items: renderers.map((renderer) => {
            return {
                value: renderer.id,
                ...renderer
            };
        }),
        value: map.renderer.id,
        onSelect: (id) => {
            let renderer = renderers.find((renderer) => {
                return renderer.id === id;
            });

            if (renderer) {
                map.setRenderer(renderer);
            }
        }
    }));
};

export const useMapRendererSelectorFromModule = (mapModule?) => {
    let mapModuleState = useMapModuleState(mapModule);
    return useMapRendererSelector({
        map: mapModuleState.map,
        renderers: mapModuleState.config.renderers || []
    });
};

