import { observe, reaction } from 'mobx';
import { onPatch } from 'mobx-state-tree';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer } from '@cgi-eo/map-core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

export class FeatureLayerController extends MapLayerController<IFeatureLayerRenderer> {

    protected collectionUnsubscribe_;

    protected createLayerRenderer_(mapRenderer) {
        return mapRenderer.getLayersFactory().create(FEATURE_LAYER_ID, {
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
        if (this.collectionUnsubscribe_) {
            this.collectionUnsubscribe_();
            delete this.collectionUnsubscribe_;
        }
    }

    protected onSourceChange_(source) {
        if (this.collectionUnsubscribe_) {
            this.collectionUnsubscribe_();
            delete this.collectionUnsubscribe_;
            this.layerRenderer_.removeAllFeatures();
        }
        if (source) {
            source.items.forEach((item) => {
                this.addFeature_(item);
            });

            this.collectionUnsubscribe_ = onPatch(source, (change, reverse) => {
                switch (change.op) {
                    case 'add':
                        this.addFeature_(this.mapLayer_.source.getItemFromPath(change.path));
                        break;
                    case 'remove':
                        this.layerRenderer_.removeFeature(reverse.value.id);
                        break;
                    case 'replace':
                        let item = this.mapLayer_.source.getItemFromPath(change.path);
                        this.layerRenderer_.updateFeatureStyle(item.id, this.mapLayer_.styleGetter(item));
                        this.layerRenderer_.updateFeatureGeometry(item.id, this.mapLayer_.geometryGetter(item));
                        break;
                }
            });
        }
    }

    protected addFeature_(entity) {
        this.layerRenderer_.addFeature(
            entity.id,
            this.mapLayer_.geometryGetter(entity),
            this.mapLayer_.styleGetter(entity)
        );
    }

}

layerControllersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new FeatureLayerController(config);
});
