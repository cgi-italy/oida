import React from 'react';
import { observer } from 'mobx-react';

import { IMap } from '@oida/state-mst';

import { ChoiceSelectorRenderer } from '@oida/ui-react-core';

import { MAP_MODULE_DEFAULT_ID } from '../map-module';
import { inject } from '../../../utils/inject';

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

        this.props.mapState.setRenderer(renderer);
    }

    render() {
        let { render, renderers, mapState, ...props } = this.props;

        let value = renderers.find((renderer) => {
            return renderer.id === mapState.renderer.id;
        }).id;

        let items = renderers.map((renderer) => {

            return Object.assign({
                value: renderer.id,
            }, renderer);
        });

        return render({
            value: value,
            items: items,
            onSelect: this.onRendererSelect.bind(this)
        });
    }
}

export const MapRendererSelector = observer(MapRendererSelectorBase);

export const MapRendererSelectorS = inject(({appState}) => {
    return {
        mapState: appState[MAP_MODULE_DEFAULT_ID].map
    };
})(MapRendererSelector);
