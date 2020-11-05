import { reaction, IReactionDisposer, IObservableArray, makeObservable, observable } from 'mobx';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer, IMapRenderer, IFeatureStyle, Geometry, GeometryCollection } from '@oida/core';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';

import { ArrayTracker } from '../../utils';

import { FeatureLayer, FeatureInterface, FeatureStyleGetter, FeatureGeometryGetter } from '../../models/map/layers/feature-layer';

type FeatureTracker = {
    ids: Set<string>,
    geometryType?: string;
    disposeGeometryObserver?: IReactionDisposer,
    disposeStyleObserver?: IReactionDisposer
};

export type FeatureData<T> = {
    model: T,
    layer: IFeatureLayerRenderer<FeatureData<T>>
};

export class FeatureLayerController
<T extends FeatureInterface> extends MapLayerController<IFeatureLayerRenderer<FeatureData<T>>, FeatureLayer<T>> {

    private sourceTracker_: ArrayTracker<T, FeatureTracker> | undefined;
    private geometryGetter_: FeatureGeometryGetter<T>;
    private styleGetter_: FeatureStyleGetter<T>;

    constructor(config) {
        super(config);

        this.geometryGetter_ = this.mapLayer_.config.value.geometryGetter;
        this.styleGetter_ = this.mapLayer_.config.value.styleGetter;

        makeObservable<FeatureLayerController<T>, 'styleGetter_' | 'geometryGetter_'>(this, {
            styleGetter_: observable.ref,
            geometryGetter_: observable.ref
        });
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {
        const { styleGetter, geometryGetter, ...others } = this.mapLayer_.config.value || {};
        if (styleGetter) {
            this.styleGetter_ = styleGetter;
        }
        if (geometryGetter) {
            this.geometryGetter_ = geometryGetter;
        }

        return <IFeatureLayerRenderer>mapRenderer.getLayersFactory().create(FEATURE_LAYER_ID, {
            mapRenderer: mapRenderer,
            ...others
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
            reaction(() => {
                return this.mapLayer_.config.value;
            }, (config) => {
                if (!config) {
                    return;
                } else {
                    if (config.styleGetter !== this.styleGetter_) {
                        this.styleGetter_ = config.styleGetter;
                    }
                    if (config.geometryGetter !== this.geometryGetter_) {
                        this.geometryGetter_ = config.geometryGetter;
                    }
                }
            })
        );

    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        if (this.sourceTracker_) {
            this.sourceTracker_.destroy();
            delete this.sourceTracker_;
        }
    }

    protected onSourceChange_(source: IObservableArray<T> | undefined) {

        if (this.sourceTracker_) {
            this.sourceTracker_.destroy();
            delete this.sourceTracker_;
        }
        if (source) {
            this.sourceTracker_ = new ArrayTracker({
                items: source,
                onItemAdd: this.addFeature_.bind(this),
                onItemRemove: this.removeFeature_.bind(this)
            });
        }
    }

    protected addFeature_(feature: T) {

        let geometry = this.geometryGetter_(feature);

        if (geometry && (geometry.type === 'GeometryCollection' || geometry.type === 'GeometryCollectionEx')) {
            return this.addGeometryCollectionFeature_(feature);
        } else {
            return this.addSimpleGeometryFeature_(feature);
        }
    }

    protected addSimpleGeometryFeature_(
        feature: T,
        existingFeatureTracker?: FeatureTracker
    ) {

        const featureTracker = existingFeatureTracker || {
            ids: new Set()
        };

        const layerRenderer = this.layerRenderer_;
        if (!layerRenderer) {
            return featureTracker;
        }

        const featureId = feature.id;

        featureTracker.disposeStyleObserver = reaction(() => this.styleGetter_(feature), (style) => {
            if (layerRenderer.hasFeature(featureId)) {
                layerRenderer.updateFeatureStyle(featureId, style[0] || style);
            }
        });

        featureTracker.disposeGeometryObserver = reaction(() => this.geometryGetter_(feature), (geometry) => {
            if (geometry && (geometry.type === 'GeometryCollection' || geometry.type === 'GeometryCollectionEx')) {
                this.removeFeature_(featureTracker);
                this.addGeometryCollectionFeature_(feature, featureTracker);
            } else {
                if (geometry) {
                    if (geometry.type === featureTracker.geometryType && layerRenderer.hasFeature(featureId)) {
                        layerRenderer.updateFeatureGeometry(featureId, geometry);
                    } else {
                        layerRenderer.removeFeature(featureId);
                        const style = this.styleGetter_(feature);
                        layerRenderer.addFeature(featureId, geometry, style[0] || style, {
                            model: feature,
                            layer: layerRenderer
                        });
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
        feature: T,
        existingFeatureTracker?: FeatureTracker
    ) {

        const featureTracker = existingFeatureTracker || {
            ids: new Set<string>()
        };

        const layerRenderer = this.layerRenderer_;
        if (!layerRenderer) {
            return featureTracker;
        }

        featureTracker.disposeStyleObserver = reaction(() => this.styleGetter_(feature), (style) => {
            featureTracker.ids.forEach((id, idx) => {
                layerRenderer.updateFeatureStyle(id, style[idx] || style);
            });
        });

        featureTracker.disposeGeometryObserver = reaction(() => this.geometryGetter_(feature), (geometry) => {
            if (geometry) {
                if (geometry.type !== 'GeometryCollection' && geometry.type !== 'GeometryCollectionEx') {
                    featureTracker.ids.forEach((id) => {
                        layerRenderer.removeFeature(id);
                    });
                    this.addSimpleGeometryFeature_(feature, featureTracker);
                } else {
                    featureTracker.ids.forEach((id) => {
                        layerRenderer.removeFeature(id);
                    });
                    featureTracker.ids.clear();

                    const style = this.styleGetter_(feature);
                    geometry.geometries.forEach((geometry, idx) => {
                        let id = `${feature.id}_${idx}`;
                        layerRenderer.addFeature(id, geometry, style[idx] || style, {
                            model: feature,
                            layer: layerRenderer
                        });
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
