import React from 'react';
import { observer } from 'mobx-react';

import { IGroupLayer, ITileLayer } from '@oida/state-mst';

import { ChoiceSelectorRenderer } from '@oida/ui-react-core';

import { MapModule, DefaultMapModule } from '../map-module';
import { injectFromModuleState, injectFromModuleConfig } from '../../with-app-module';


export type TileSourceItem<T> = {
    id: string;
    name: string;
    config: any;
}  & T;

export type TileSourceSelectorProps<T> = {
    sources: TileSourceItem<T>[];
    group: IGroupLayer;
    layerIdx: number;
    render: ChoiceSelectorRenderer<T>;
};

class TileSourceSelectorBase<T> extends React.Component<TileSourceSelectorProps<T>> {

    onTileSourceSelect(id) {
        let source = this.props.sources.find((source) => {
            return source.id === id;
        });

        let layer = this.props.group.children.itemAt(this.props.layerIdx) as ITileLayer;
        layer.setSource(source.config);
        layer.setName(source.id);
    }

    render() {

        let { render, sources, group, layerIdx, ...props } = this.props;

        let value = group.children.itemAt(layerIdx).name;

        let items = sources.map((source) => {

            return Object.assign({
                value: source.id,
            }, source);

        });

        return render({
            value: value,
            items: items,
            onSelect: this.onTileSourceSelect.bind(this)
        });
    }
}

export const MapTileSourceSelector = observer(TileSourceSelectorBase);

export const injectMapRootLayersFromModule = (mapModule: MapModule) => injectFromModuleState(mapModule, (moduleState) => {
    return {
        group: moduleState.map.layers,
        layerIdx: 0
    };
});


export const injectBaseLayerSourcesFromModuleConfig = (mapModule: MapModule) => injectFromModuleConfig(mapModule, (moduleConfig) => {
    return {
        sources: moduleConfig.baseLayers
    };
});

export const MapBaseLayerSelectorS = injectMapRootLayersFromModule(DefaultMapModule)(MapTileSourceSelector);

export const MapBaseLayerSelectorSC = injectBaseLayerSourcesFromModuleConfig(DefaultMapModule)(MapBaseLayerSelectorS);
