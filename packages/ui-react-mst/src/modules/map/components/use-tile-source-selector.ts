import { useObserver } from 'mobx-react';

import { IGroupLayer, ITileLayer } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';
import { MapModule } from '../map-module';

export type TileSourceItem = {
    id: string;
    name: string;
    description?: string;
    config: any;
};

export type TileSourceSelectorProps = {
    sources: TileSourceItem[];
    group: IGroupLayer;
    layerIdx: number;
};


export const useTileSourceSelector = ({sources, group, layerIdx}: TileSourceSelectorProps) => {
    return useObserver(() => ({
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
                let layer = group.children.itemAt(layerIdx) as ITileLayer;
                layer.setSource(source.config);
                layer.setName(source.id);
            }
        }
    }));
};

export const useMapBaseLayerSelectorFromModule = (mapModule?: MapModule) => {
    let moduleState = useMapModuleState(mapModule);
    return useTileSourceSelector({
        group: moduleState.map.layers,
        layerIdx: 0,
        sources: moduleState.config.baseLayers || []
    });
};

