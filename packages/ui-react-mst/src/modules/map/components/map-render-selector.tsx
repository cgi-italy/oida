import React from 'react';
import { observer } from 'mobx-react';

import { IMap } from '@oida/state-mst';

import { ChoiceSelectorRenderer } from '@oida/ui-react-core';

import { MapModule, DefaultMapModule } from '../map-module';
import { injectFromModuleState, injectFromModuleConfig } from '../../with-app-module';


export type MapRendererItem<T> = {
    id: string;
    name: string;
} & T;

export type MapRendererSelectorProps<T> = {
    renderers: MapRendererItem<T>[];
    mapState: IMap;
    render: ChoiceSelectorRenderer<T>;
};

class MapRendererSelectorBase<T> extends React.Component<MapRendererSelectorProps<T>> {

    onRendererSelect(id) {
        let renderer = this.props.renderers.find((renderer) => {
            return renderer.id === id;
        });

        if (renderer) {
            this.props.mapState.setRenderer(renderer);
        }
    }

    render() {
        let { render, renderers, mapState, ...props } = this.props;

        let items = renderers.map((renderer) => {

            return Object.assign({
                value: renderer.id,
            }, renderer);
        });

        return render({
            value: mapState.renderer.id,
            items: items,
            onSelect: this.onRendererSelect.bind(this)
        });
    }
}

export const MapRendererSelector = observer(MapRendererSelectorBase);

export const injectMapRendererSelectorStateFromModule = (mapModule: MapModule) => injectFromModuleState(mapModule, (moduleState) => {
    return {
        mapState: moduleState.map
    };
});


export const injectMapRenderersFromModuleConfig = (mapModule: MapModule) => injectFromModuleConfig(mapModule, (moduleConfig) => {
    return {
        renderers: moduleConfig.renderers
    };
});

export const MapRendererSelectorS = injectMapRendererSelectorStateFromModule(DefaultMapModule)(MapRendererSelector);
export const MapRendererSelectorSC = injectMapRenderersFromModuleConfig(DefaultMapModule)(MapRendererSelectorS);
