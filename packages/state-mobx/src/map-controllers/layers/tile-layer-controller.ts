import { reaction } from 'mobx';

import { TILE_LAYER_ID, ITileLayerRenderer, IMapRenderer, LoadingState } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { TileLayer } from '../../models/map/layers/tile-layer';

export class TileLayerController extends MapLayerController<ITileLayerRenderer, TileLayer> {

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
            this.mapLayer_.loadingStatus.update({
                value: LoadingState.Loading,
                percentage: (this.tileLoadingState_.loaded / this.tileLoadingState_.pending) * 100
            });
        };

        const onTileLoadEnd = () => {
            this.tileLoadingState_.loaded++;
            if (this.tileLoadingState_.pending <= this.tileLoadingState_.loaded) {
                this.mapLayer_.loadingStatus.update({
                    value: LoadingState.Success,
                    percentage: 100
                });

                this.tileLoadingState_.pending = 0;
                this.tileLoadingState_.loaded = 0;
            } else {
                this.mapLayer_.loadingStatus.update({
                    value: LoadingState.Loading,
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

        const layerRenderer = this.layerRenderer_!;

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.source, (source) => {
                this.resetLoadingState_();
                layerRenderer.updateSource(source);
            })
        );

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.sourceRevision, (revision) => {
                this.resetLoadingState_();
                layerRenderer.forceRefresh();
            })
        );

    }

    protected resetLoadingState_() {
        this.tileLoadingState_.pending = 0;
        this.tileLoadingState_.loaded = 0;
        this.mapLayer_.loadingStatus.update({
            value: LoadingState.Success,
            percentage: 100
        });
    }

}

layerControllersFactory.register(TILE_LAYER_ID, (config) => {
    return new TileLayerController(config);
});

