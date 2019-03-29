import { reaction, IReactionDisposer } from 'mobx';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer, IMapRenderer } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ArrayTracker } from '../../utils';

import { IFeatureLayer } from '../../types/layers/feature-layer';
import { createEntityReference } from '../../types/entity/entity-reference';


type FeatureTracker = {
    id: string,
    disposeGeometryObserver: IReactionDisposer,
    disposeStyleObserver: IReactionDisposer
};

const defaultGeometryGetter = (entity) => entity.geometry;
const defaultStyleGetter = (entity) => entity.style;

export const featureIdFromEntityReference = (entityReference: string, geometryIdx?: number) => {
    if (typeof(geometryIdx) === 'number') {
        return `${entityReference}[${geometryIdx}]`;
    } else {
        return entityReference;
    }
};

export const entityReferenceFromFeatureId = (featureId: string) => {
    return featureId.replace(/\[[0-9]+\]$/, '');
};

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
            reaction(() => {
                let source;
                //source could be an invalid reference
                try {
                    source = this.mapLayer_.source;
                } catch (e) {
                    source = null;
                }
                return source;
            }, (source) => {
                this.onSourceChange_(source);
            }, {fireImmediately: true})
        );

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        if (this.sourceTracker_) {
            this.sourceTracker_.destroy();
            delete this.sourceTracker_;
        }
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

        let entityReference = createEntityReference(entity);

        let geometry = geometryGetter(entity);
        let style = styleGetter(entity);

        if (geometry.type === 'GeometryCollection') {
            let geometries = geometry.geometries;

            let featureIds = [];

            geometries.forEach((geometry, idx) => {

                let id = featureIdFromEntityReference(entityReference, idx);

                this.layerRenderer_.addFeature(
                    id,
                    geometry,
                    style[idx] || style
                );

                featureIds.push(id);
            });

            let disposeGeometryObserver = reaction(() => geometryGetter(entity), (geometry) => {
                let geometries = geometry.geometries;

                featureIds.forEach((id, idx) => {
                    this.layerRenderer_.updateFeatureGeometry(id, geometries[idx]);
                });

            });

            let disposeStyleObserver = reaction(() => styleGetter(entity), (style) => {
                featureIds.forEach((id, idx) => {
                    this.layerRenderer_.updateFeatureStyle(id, style[idx] || style);
                });
            });

            return {
                id: featureIds,
                disposeGeometryObserver,
                disposeStyleObserver
            };
        } else {

            let featureId = featureIdFromEntityReference(entityReference);

            this.layerRenderer_.addFeature(
                featureId,
                geometryGetter(entity),
                styleGetter(entity)
            );

            let disposeGeometryObserver = reaction(() => geometryGetter(entity), (geometry) => {
                this.layerRenderer_.updateFeatureGeometry(featureId, geometry);
            });

            let disposeStyleObserver = reaction(() => styleGetter(entity), (style) => {
                this.layerRenderer_.updateFeatureStyle(featureId, style);
            });

            return {
                id: featureId,
                disposeGeometryObserver,
                disposeStyleObserver
            };
        }
    }

    protected removeFeature_(featureTracker) {
        featureTracker.disposeGeometryObserver();
        featureTracker.disposeStyleObserver();
        if (Array.isArray(featureTracker.id)) {
            featureTracker.id.forEach((id) => {
                this.layerRenderer_.removeFeature(id);
            });
        } else {
            this.layerRenderer_.removeFeature(featureTracker.id);
        }
    }

}

layerControllersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new FeatureLayerController(config);
});
