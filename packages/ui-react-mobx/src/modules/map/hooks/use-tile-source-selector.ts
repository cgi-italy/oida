import { GroupLayer, TileLayer } from '@oida/state-mobx';

import { useSelector } from '../../../core';
import { MapBaseLayerConfig } from '../map-module';
import { useMapModule } from './use-map-module';


export type TileSourceSelectorProps = {
    sources: MapBaseLayerConfig[];
    group: GroupLayer;
    layerIdx: number;
};

export const useTileSourceSelector = (props: TileSourceSelectorProps) => {

    const {sources, group, layerIdx} = props;

    return useSelector(() => ({
        items: sources.map((source) => {
            return {
                value: source.id,
                ...source
            };
        }),
        value: group.children.itemAt(layerIdx).name,
        onSelect: (id) => {
            let source = sources.find((source) => {
                return source.id === id;
            });

            if (source) {
                let layer = group.children.itemAt(layerIdx);
                if (layer instanceof TileLayer) {
                    layer.setSource(source.config);
                    layer.setName(source.name);
                }
            }
        }
    }));
};

export const useMapBaseLayerSelectorFromModule = (mapModuleId?: string) => {
    let moduleState = useMapModule(mapModuleId);
    return useTileSourceSelector({
        group: moduleState.map.layers,
        layerIdx: 0,
        sources: moduleState.config.baseLayers || []
    });
};

