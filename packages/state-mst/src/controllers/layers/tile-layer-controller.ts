import { observe } from 'mobx';

import { TILE_LAYER_ID, ITileLayerRenderer, IMapRenderer } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ITileLayer } from '../../types/layers/tile-layer';
export class TileLayerController extends MapLayerController<ITileLayerRenderer, ITileLayer> {

    constructor(config) {
        super(config);
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {
        return <ITileLayerRenderer>mapRenderer.getLayersFactory().create(TILE_LAYER_ID, {
            mapLayer: this.mapLayer_,
            mapRenderer: mapRenderer
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'source', (change) => {
                this.layerRenderer_!.updateSource(change.newValue.value);
            })
        );

    }

}

layerControllersFactory.register(TILE_LAYER_ID, (config) => {
    return new TileLayerController(config);
});

