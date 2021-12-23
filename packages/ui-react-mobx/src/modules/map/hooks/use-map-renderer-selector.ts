import { Map } from '@oidajs/state-mobx';

import { useSelector } from '../../../core';
import { MapRendererConfig } from '../map-module';
import { useMapModule } from './use-map-module';

export type MapRendererSelectorProps = {
    renderers: MapRendererConfig[];
    map: Map;
};

export const useMapRendererSelector = (props: MapRendererSelectorProps) => {
    const { map, renderers } = props;

    return useSelector(() => ({
        items: renderers.map((renderer) => {
            return {
                value: renderer.id,
                ...renderer
            };
        }),
        value: map.renderer.id,
        onSelect: (id) => {
            const renderer = renderers.find((renderer) => {
                return renderer.id === id;
            });

            if (renderer) {
                map.setRenderer(renderer);
            }
        }
    }));
};

export const useMapRendererSelectorFromModule = (mapModuleId?: string) => {
    const mapModuleState = useMapModule(mapModuleId);
    return useMapRendererSelector({
        map: mapModuleState.map,
        renderers: mapModuleState.config.renderers || []
    });
};
