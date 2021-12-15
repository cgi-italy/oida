import { reaction, IReactionDisposer, IObservableArray, makeObservable, observable } from 'mobx';
import { v4 as uuid } from 'uuid';

import { FEATURE_LAYER_ID, IFeatureLayerRenderer, IMapRenderer, IFeature } from '@oidajs/core';

import { ArrayTracker } from '../../utils';
import { FeatureLayer, FeatureInterface, FeatureStyleGetter, FeatureGeometryGetter } from '../../models/map/layers/feature-layer';
import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';


type FeatureTracker = {
    ids: Set<string>,
    geometryType?: string;
    disposeGeometryObserver?: IReactionDisposer,
    disposeStyleObserver?: IReactionDisposer
};

export type FeatureData<T extends FeatureInterface = FeatureInterface> = {
    model: T,
    layer: FeatureLayer<T>
};

export class FeatureLayerController
<T extends FeatureInterface> extends MapLayerController<IFeatureLayerRenderer<FeatureData<T>>, FeatureLayer<T>> {

    private sourceTracker_: ArrayTracker<T, FeatureTracker> | undefined;
    @observable.ref private geometryGetter_: FeatureGeometryGetter<T>;
    @observable.ref private styleGetter_: FeatureStyleGetter<T>;

    constructor(config) {
        super(config);

        this.geometryGetter_ = this.mapLayer_.config.value.geometryGetter;
        this.styleGetter_ = this.mapLayer_.config.value.styleGetter;

        makeObservable(this);
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {
        const {
            styleGetter, geometryGetter,
            onFeatureSelect, onFeatureHover,
            rendererOptions
        } = this.mapLayer_.config.value || {};
        if (styleGetter) {
            this.styleGetter_ = styleGetter;
        }
        if (geometryGetter) {
            this.geometryGetter_ = geometryGetter;
        }

        const layerRendererOptions = rendererOptions ? rendererOptions[mapRenderer.id] : undefined;
        return <IFeatureLayerRenderer>mapRenderer.getLayersFactory().create(FEATURE_LAYER_ID, {
            ...this.getRendererConfig_(mapRenderer),
            onFeatureHover: onFeatureHover ? (feature: IFeature<FeatureData<T>>, coordinate: GeoJSON.Position) => {
                onFeatureHover(feature.data.model, coordinate);
            } : undefined,
            onFeatureSelect: onFeatureSelect ? (feature: IFeature<FeatureData<T>>, coordinate: GeoJSON.Position) => {
                onFeatureSelect(feature.data.model, coordinate);
            } : undefined,
            ...layerRendererOptions
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

        const featureId = feature.id.toString();

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
                            layer: this.mapLayer_
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
            let idx = 0;
            featureTracker.ids.forEach((id) => {
                const geometryId = id.split('-_-')[1];
                layerRenderer.updateFeatureStyle(id, style[geometryId] || style[idx] || style);
                idx++;
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

                    const newIds = new Set<string>();
                    const style = this.styleGetter_(feature);

                    geometry.geometries.forEach((geometry, idx) => {
                        const id = `${feature.id}-_-${geometry.id || uuid()}`;
                        if (featureTracker.ids.has(id)) {
                            layerRenderer.updateFeatureGeometry(id, geometry);
                        } else {
                            layerRenderer.addFeature(id, geometry, style[geometry.id] || style[idx] || style, {
                                model: feature,
                                layer: this.mapLayer_
                            });
                        }
                        newIds.add(id);
                    });

                    featureTracker.ids.forEach((id) => {
                        if (!newIds.has(id)) {
                            layerRenderer.removeFeature(id);
                        }
                    });

                    featureTracker.ids = newIds;

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
