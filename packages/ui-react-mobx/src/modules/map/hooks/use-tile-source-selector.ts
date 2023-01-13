import { GroupLayer, TileLayer } from '@oidajs/state-mobx';

import { useSelector } from '../../../core';
import { MapBaseLayerConfig } from '../map-module';
import { useMapModule } from './use-map-module';

export type TileSourceSelectorProps = {
    sources: MapBaseLayerConfig[];
    group: GroupLayer;
    layerIdx: number;
};

export const useTileSourceSelector = (props: TileSourceSelectorProps) => {
    const { sources, group, layerIdx } = props;

    return useSelector(() => ({
        items: sources.map((source) => {
            return {
                value: source.id,
                ...source
            };
        }),
        value: group.children.itemAt(layerIdx).name,
        onSelect: (id) => {
            const source = sources.find((source) => {
                return source.id === id;
            });

            if (source) {
                const layer = group.children.itemAt(layerIdx);
                if (layer instanceof TileLayer) {
                    layer.setSource(source.source);
                    layer.setName(source.id);
                }
            }
        }
    }));
};

export const useMapBaseLayerSelectorFromModule = (mapModuleId?: string) => {
    const moduleState = useMapModule(mapModuleId);
    return useTileSourceSelector({
        group: moduleState.map.layers,
        layerIdx: 0,
        sources: moduleState.config.baseLayers || []
    });
};
