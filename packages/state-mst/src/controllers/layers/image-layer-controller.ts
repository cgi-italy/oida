import { autorun, observe } from 'mobx';

import { IMAGE_LAYER_ID, IImageLayerRenderer, IMapRenderer, LoadingState } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { IImageLayer } from '../../types/layers/image-layer';

export class ImageLayerController extends MapLayerController<IImageLayerRenderer, IImageLayer> {

    constructor(config) {
        super(config);
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {

        const onImageLoadStart = () => {

            this.mapLayer_.setLoadingProps({
                state: LoadingState.Loading,
                percentage: 0
            });

        };

        const onImageLoadEnd = () => {
            this.mapLayer_.setLoadingProps({
                state: LoadingState.Success,
                percentage: 100
            });
        };


        return <IImageLayerRenderer>mapRenderer.getLayersFactory().create(IMAGE_LAYER_ID, {
            mapLayer: this.mapLayer_,
            mapRenderer: mapRenderer,
            onImageLoadStart: onImageLoadStart,
            onImageLoadEnd: onImageLoadEnd
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        this.subscriptionTracker_.addSubscription(
            autorun(() => {
                this.mapLayer_.setLoadingProps({
                    state: LoadingState.Success,
                    percentage: 100
                });
                if (this.mapLayer_.sourceType) {
                    this.layerRenderer_!.updateSource({
                        type: this.mapLayer_.sourceType,
                        config: this.mapLayer_.sourceConfig
                    });
                } else {
                    this.layerRenderer_!.updateSource(undefined);
                }
            })
        );

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'sourceRevision', (change) => {
                this.layerRenderer_!.forceRefresh();
            })
        );
    }

}

layerControllersFactory.register(IMAGE_LAYER_ID, (config) => {
    return new ImageLayerController(config);
});

