import { reaction, IReactionDisposer } from 'mobx';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer, IMapRenderer, IFeatureStyle, Geometry, GeometryCollection } from '@oida/core';

import { IEntity } from '../../types';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ArrayTracker } from '../../utils';

import { IFeatureLayer } from '../../types/layers/feature-layer';
import { createEntityReference } from '../../types/entity/entity-reference';


type FeatureTracker = {
    ids: Set<string>,
    geometryType?: string;
    disposeGeometryObserver?: IReactionDisposer,
    disposeStyleObserver?: IReactionDisposer
};

type EntityStyleGetter = (entity: IEntity) => IFeatureStyle | IFeatureStyle[];
type EntityGeometryGetter = (entity: IEntity) => Geometry | undefined;

const defaultGeometryGetter: EntityGeometryGetter = (entity) => (entity as any).geometry;
const defaultStyleGetter: EntityStyleGetter = (entity) => (entity as any).style;

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

    private sourceTracker_: ArrayTracker<FeatureTracker> | undefined;

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

    protected addFeature_(entity: IEntity) {


        let geometryGetter: EntityGeometryGetter = this.mapLayer_.geometryGetter as EntityGeometryGetter || defaultGeometryGetter;

        let geometry = geometryGetter(entity);

        if (geometry && (geometry.type === 'GeometryCollection' || geometry.type === 'GeometryCollectionEx')) {
            return this.addGeometryCollectionFeature_(entity);
        } else {
            return this.addSimpleGeometryFeature_(entity);
        }
    }

    protected addSimpleGeometryFeature_(
        entity: IEntity,
        existingFeatureTracker?: FeatureTracker
    ) {

        const featureTracker = existingFeatureTracker || {
            ids: new Set()
        };

        const layerRenderer = this.layerRenderer_;
        if (!layerRenderer) {
            return featureTracker;
        }

        const geometryGetter: EntityGeometryGetter = this.mapLayer_.geometryGetter as EntityGeometryGetter || defaultGeometryGetter;
        const styleGetter: EntityStyleGetter = this.mapLayer_.styleGetter as EntityStyleGetter || defaultStyleGetter;
        const entityReference = createEntityReference(entity);
        const featureId = featureIdFromEntityReference(entityReference);

        featureTracker.disposeStyleObserver = reaction(() => styleGetter(entity), (style) => {
            if (layerRenderer.getFeature(featureId)) {
                layerRenderer.updateFeatureStyle(featureId, style[0] || style);
            }
        });

        featureTracker.disposeGeometryObserver = reaction(() => geometryGetter(entity), (geometry) => {
            if (geometry && (geometry.type === 'GeometryCollection' || geometry.type === 'GeometryCollectionEx')) {
                this.removeFeature_(featureTracker);
                this.addGeometryCollectionFeature_(entity, featureTracker);
            } else {
                if (geometry) {
                    if (geometry.type === featureTracker.geometryType && layerRenderer.getFeature(featureId)) {
                        layerRenderer.updateFeatureGeometry(featureId, geometry);
                    } else {
                        layerRenderer.removeFeature(featureId);
                        const style = styleGetter(entity);
                        layerRenderer.addFeature(featureId, geometry, style[0] || style);
                    }
                    featureTracker.ids.add(featureId);
                    featureTracker.geometryType = geometry.type;
                } else {
                    layerRenderer.removeFeature(featureId);
                    featureTracker.ids.delete(featureId);
                    featureTracker.geometryType = undefined;
                }
            }
        }, {
            fireImmediately: true
        });

        return featureTracker;
    }

    protected addGeometryCollectionFeature_(
        entity: IEntity,
        existingFeatureTracker?: FeatureTracker
    ) {

        const featureTracker = existingFeatureTracker || {
            ids: new Set<string>()
        };

        const layerRenderer = this.layerRenderer_;
        if (!layerRenderer) {
            return featureTracker;
        }

        const geometryGetter: EntityGeometryGetter = this.mapLayer_.geometryGetter as EntityGeometryGetter || defaultGeometryGetter;
        const styleGetter: EntityStyleGetter = this.mapLayer_.styleGetter as EntityStyleGetter || defaultStyleGetter;

        let entityReference = createEntityReference(entity);

        featureTracker.disposeStyleObserver = reaction(() => styleGetter(entity), (style) => {
            featureTracker.ids.forEach((id, idx) => {
                this.layerRenderer_!.updateFeatureStyle(id, style[idx] || style);
            });
        });

        featureTracker.disposeGeometryObserver = reaction(() => geometryGetter(entity), (geometry) => {
            if (geometry) {
                if (geometry.type !== 'GeometryCollection' && geometry.type !== 'GeometryCollectionEx') {
                    this.removeFeature_(featureTracker);
                    this.addSimpleGeometryFeature_(entity, featureTracker);
                } else {
                    featureTracker.ids.forEach((id) => {
                        layerRenderer.removeFeature(id);
                    });
                    featureTracker.ids.clear();

                    const style = styleGetter(entity);
                    geometry.geometries.forEach((geometry, idx) => {
                        let id = featureIdFromEntityReference(entityReference, idx);
                        layerRenderer.addFeature(id, geometry, style[idx] || style);
                        featureTracker.ids.add(id);
                    });
                    featureTracker.geometryType = geometry.type;
                }
            } else {
                featureTracker.ids.forEach((id) => {
                    layerRenderer.removeFeature(id);
                });
                featureTracker.ids.clear();
                featureTracker.geometryType = undefined;
            }
        }, {
            fireImmediately: true
        });

        return featureTracker;
    }

    protected removeFeature_(featureTracker: FeatureTracker) {
        if (featureTracker.disposeGeometryObserver) {
            featureTracker.disposeGeometryObserver();
        }
        if (featureTracker.disposeStyleObserver) {
            featureTracker.disposeStyleObserver();
        }

        const layerRenderer = this.layerRenderer_;
        if (layerRenderer) {
            featureTracker.ids.forEach((id) => {
                layerRenderer.removeFeature(id);
            });
        }
    }

}

layerControllersFactory.register(FEATURE_LAYER_ID, (config) => {
    return new FeatureLayerController(config);
});
