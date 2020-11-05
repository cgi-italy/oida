import { observable, action, makeObservable } from 'mobx';

import { TILE_LAYER_ID, TileSource } from '@oida/core';

import { MapLayer, MapLayerProps } from './map-layer';


export type TileLayerProps = {
    source?: TileSource
} & Omit<MapLayerProps, 'layerType'>;

export class TileLayer extends MapLayer {

    @observable.ref source: TileSource | undefined;
    @observable sourceRevision: number;

    constructor(props: TileLayerProps) {
        super({
            ...props,
            layerType: TILE_LAYER_ID
        });

        this.source = props.source;
        this.sourceRevision = 0;

        makeObservable(this);
    }

    @action
    setSource(source: TileSource | undefined) {
        this.source = source;
    }

    @action
    forceRefresh() {
        this.sourceRevision++;
    }
}

MapLayer.register(TILE_LAYER_ID, TileLayer);
