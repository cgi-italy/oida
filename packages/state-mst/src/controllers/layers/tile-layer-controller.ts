import { observe } from 'mobx';

import { TILE_LAYER_ID, ITileLayerRenderer, IMapRenderer, LoadingState } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ITileLayer } from '../../types/layers/tile-layer';
export class TileLayerController extends MapLayerController<ITileLayerRenderer, ITileLayer> {

    protected tileLoadingState_ = {
        pending: 0,
        loaded: 0
    };

    constructor(config) {
        super(config);
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {

        const onTileLoadStart = () => {
            this.tileLoadingState_.pending++;
            this.mapLayer_.setLoadingProps({
                state: LoadingState.Loading,
                percentage: (this.tileLoadingState_.loaded / this.tileLoadingState_.pending) * 100
            });
        };

        const onTileLoadEnd = () => {
            this.tileLoadingState_.loaded++;
            if (this.tileLoadingState_.pending <= this.tileLoadingState_.loaded) {
                this.mapLayer_.setLoadingProps({
                    state: LoadingState.Success,
                    percentage: 100
                });

                this.tileLoadingState_.pending = 0;
                this.tileLoadingState_.loaded = 0;
            } else {
                this.mapLayer_.setLoadingProps({
                    state: LoadingState.Loading,
                    percentage: (this.tileLoadingState_.loaded / this.tileLoadingState_.pending) * 100
                });
            }
        };


        return <ITileLayerRenderer>mapRenderer.getLayersFactory().create(TILE_LAYER_ID, {
            mapLayer: this.mapLayer_,
            mapRenderer: mapRenderer,
            onTileLoadStart: onTileLoadStart,
            onTileLoadEnd: onTileLoadEnd
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'source', (change) => {
                this.resetLoadingState_();
                this.layerRenderer_!.updateSource(change.newValue.value);
            })
        );

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'sourceRevision', (change) => {
                this.resetLoadingState_();
                this.layerRenderer_!.forceRefresh();
            })
        );

    }

    protected resetLoadingState_() {
        this.tileLoadingState_.pending = 0;
        this.tileLoadingState_.loaded = 0;
        this.mapLayer_.setLoadingProps({
            state: LoadingState.Success,
            percentage: 100
        });
    }

}

layerControllersFactory.register(TILE_LAYER_ID, (config) => {
    return new TileLayerController(config);
});

