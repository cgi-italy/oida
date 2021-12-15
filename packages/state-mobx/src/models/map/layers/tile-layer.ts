import { observable, action, makeObservable } from 'mobx';

import { TILE_LAYER_ID, TileSource } from '@oidajs/core';

import { MapLayer, MapLayerProps } from './map-layer';


export type TileLayerProps = {
    source?: TileSource;
    minZoomLevel?: number;
    maxZoomLevel?: number;
} & MapLayerProps<typeof TILE_LAYER_ID>;

export class TileLayer extends MapLayer {

    @observable.ref source: TileSource | undefined;
    @observable sourceRevision: number;
    @observable.ref minZoomLevel: number | undefined;
    @observable.ref maxZoomLevel: number | undefined;

    constructor(props: Omit<TileLayerProps, 'layerType'>) {
        super({
            ...props,
            layerType: TILE_LAYER_ID
        });

        this.source = props.source;
        this.minZoomLevel = props.minZoomLevel;
        this.maxZoomLevel = props.maxZoomLevel;
        this.sourceRevision = 0;

        makeObservable(this);
    }

    @action
    setSource(source: TileSource | undefined) {
        this.source = source;
    }

    @action
    setMinZoomLevel(level: number | undefined) {
        this.minZoomLevel = level;
    }

    @action
    setMaxZoomLevel(level: number | undefined) {
        this.maxZoomLevel = level;
    }

    @action
    forceRefresh() {
        this.sourceRevision++;
    }
}
