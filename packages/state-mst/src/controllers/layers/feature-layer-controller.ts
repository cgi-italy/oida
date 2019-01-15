import { observe, reaction, IReactionDisposer } from 'mobx';
import { onPatch } from 'mobx-state-tree';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer, IMapRenderer } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ArrayTracker } from '../../utils';

import { IFeatureLayer } from '../../types/layers/feature-layer';

type FeatureTracker = {
    id: string,
    disposeGeometryObserver: IReactionDisposer,
    disposeStyleObserver: IReactionDisposer
};

const defaultGeometryGetter = (entity) => entity.geometry;
const defaultStyleGetter = (entity) => entity.style;

export class FeatureLayerController extends MapLayerController<IFeatureLayerRenderer, IFeatureLayer> {

    private sourceTracker_: ArrayTracker<FeatureTracker>;

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
                let geometryGetter = this.mapLayer_.geometryGetter || defaultGeometryGetter;

                if (this.mapLayer_.source) {
                    this.mapLayer_.source.items.forEach((item) => {
                        this.layerRenderer_.updateFeatureGeometry(item.id, geometryGetter(item));
                    });
                }
            })
        );

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'styleGetter', () => {

                let styleGetter = this.mapLayer_.styleGetter || defaultStyleGetter;

                if (this.mapLayer_.source) {
                    this.mapLayer_.source.items.forEach((item) => {
                        this.layerRenderer_.updateFeatureStyle(item.id, styleGetter(item));
                    });
                }
            })
        );

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        this.sourceTracker_.destroy();
        delete this.sourceTracker_;
    }

    protected onSourceChange_(source) {

        if (this.sourceTracker_) {
            this.sourceTracker_.destroy();
            delete this.sourceTracker_;
        }
        if (source) {
            this.sourceTracker_ = new ArrayTracker({
                items: source.items,
                onItemAdd: this.addFeature_.bind(this),
                onItemRemove: this.removeFeature_.bind(this)
            });
        }
    }

    protected addFeature_(entity) {


        let geometryGetter = this.mapLayer_.geometryGetter || defaultGeometryGetter;
        let styleGetter = this.mapLayer_.styleGetter || defaultStyleGetter;

        this.layerRenderer_.addFeature(
            entity.id,
            geometryGetter(entity),
            styleGetter(entity)
        );

        let disposeGeometryObserver = reaction(() => geometryGetter(entity), (geometry) => {
            this.layerRenderer_.updateFeatureGeometry(entity.id, geometry);
        });

        let disposeStyleObserver = reaction(() => styleGetter(entity), (style) => {
            this.layerRenderer_.updateFeatureStyle(entity.id, style);
        });

        return {
            id: entity.id,
            disposeGeometryObserver,
            disposeStyleObserver
        };
    }

    protected removeFeature_(featureTracker) {
        featureTracker.disposeGeometryObserver();
        featureTracker.disposeStyleObserver();
        this.layerRenderer_.removeFeature(featureTracker.id);
    }

}

layerControllersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new FeatureLayerController(config);
});
