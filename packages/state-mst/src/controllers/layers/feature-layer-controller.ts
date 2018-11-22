import { observe, reaction } from 'mobx';
import { onPatch } from 'mobx-state-tree';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer, IMapRenderer } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { MapEntityCollectionTracker } from '../../utils';

import { IFeatureLayer } from '../../types/layers/feature-layer';

export class FeatureLayerController extends MapLayerController<IFeatureLayerRenderer, IFeatureLayer> {

    private mapEntityCollectionTracker_: MapEntityCollectionTracker<MapLayerController<IFeatureLayerRenderer, IFeatureLayer>>;

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {
        return <IFeatureLayerRenderer>mapRenderer.getLayersFactory().create(FEATURE_LAYER_ID, {
            mapRenderer: mapRenderer,
            ...this.mapLayer_.config
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        this.subscriptionTracker_.addSubscription(
            reaction(() => this.mapLayer_.source, (source) => {
                this.onSourceChange_(source);
            }, {fireImmediately: true})
        );

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'geometryGetter', () => {
                this.mapLayer_.source.items.forEach((item) => {
                    this.layerRenderer_.updateFeatureGeometry(item.id, this.mapLayer_.geometryGetter(item));
                });
            })
        );

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'styleGetter', () => {
                this.mapLayer_.source.items.forEach((item) => {
                    this.layerRenderer_.updateFeatureStyle(item.id, this.mapLayer_.styleGetter(item));
                });
            })
        );

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        this.mapEntityCollectionTracker_.destroy();
        delete this.mapEntityCollectionTracker_;
    }

    protected onSourceChange_(source) {

        if (this.mapEntityCollectionTracker_) {
            this.mapEntityCollectionTracker_.destroy();
            delete this.mapEntityCollectionTracker_;
        }
        if (source) {
            this.mapEntityCollectionTracker_ = new MapEntityCollectionTracker({
                collection: source,
                onEntityAdd: this.addFeature_.bind(this),
                onEntityRemove: this.removeFeature_.bind(this)
            });
        }
    }

    protected addFeature_(entity) {
        this.layerRenderer_.addFeature(
            entity.id,
            this.mapLayer_.geometryGetter(entity),
            this.mapLayer_.styleGetter(entity)
        );

        let geometryObserver = reaction(() => this.mapLayer_.geometryGetter(entity), (geometry) => {
            this.layerRenderer_.updateFeatureGeometry(entity.id, geometry);
        });

        let styleObserver = reaction(() => this.mapLayer_.styleGetter(entity), (style) => {
            this.layerRenderer_.updateFeatureStyle(entity.id, style);
        });

        return {
            id: entity.id,
            geometryObserver,
            styleObserver
        };
    }

    protected removeFeature_(featureTracker) {
        featureTracker.geometryObserver();
        featureTracker.styleObserver();
        this.layerRenderer_.removeFeature(featureTracker.id);
    }

}

layerControllersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new FeatureLayerController(config);
});
