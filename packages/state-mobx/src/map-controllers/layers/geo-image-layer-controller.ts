import { reaction } from 'mobx';

import { GEO_IMAGE_LAYER_ID, IGeoImageLayerRenderer, IMapRenderer } from '@oidajs/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { GeoImageLayer } from '../../models/map/layers/geo-image-layer';

export class GeoImageLayerController extends MapLayerController<IGeoImageLayerRenderer, GeoImageLayer> {
    constructor(config) {
        super(config);
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {
        return <IGeoImageLayerRenderer>mapRenderer.getLayersFactory().create(GEO_IMAGE_LAYER_ID, {
            ...this.getRendererConfig_(mapRenderer),
            ...this.mapLayer_.config,
            source: this.mapLayer_.source,
            footprint: this.mapLayer_.footprint
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        const layerRenderer = this.layerRenderer_!;

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapLayer_.source,
                (source) => {
                    layerRenderer.updateSource(source);
                }
            )
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapLayer_.footprint,
                (footprint) => {
                    layerRenderer.updateFootprint(footprint);
                }
            )
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapLayer_.sourceRevision,
                (revision) => {
                    layerRenderer.forceRefresh();
                }
            )
        );
    }
}

layerControllersFactory.register(GEO_IMAGE_LAYER_ID, (config) => {
    return new GeoImageLayerController(config);
});
