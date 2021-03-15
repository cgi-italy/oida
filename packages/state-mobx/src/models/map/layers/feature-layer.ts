import { observable, action, makeObservable, IObservableArray } from 'mobx';

import { FEATURE_LAYER_ID, Geometry, IFeatureStyle } from '@oida/core';

import { MapLayer, MapLayerProps } from './map-layer';
import { IsHoverable, IsSelectable, Config, ConfigProps, HasConfig } from '../../mixins';

export interface FeatureInterface extends IsHoverable, IsSelectable {
    id: string | number;
}

export type FeatureGeometryGetter<T extends FeatureInterface> = (entity: T) => Geometry | undefined;
export type FeatureStyleGetter<T extends FeatureInterface> = (entity: T) => IFeatureStyle | IFeatureStyle[];

export type FeatureLayerConfig<T extends FeatureInterface> = {
    geometryGetter: FeatureGeometryGetter<T>;
    styleGetter: FeatureStyleGetter<T>;
    onFeatureHover?: (feature: T, coordinate: GeoJSON.Position) => void;
    onFeatureSelect?: (feature: T, coordinate: GeoJSON.Position) => void;
    rendererOptions?: Record<string, {[props: string]: any}>;
};

export type FeatureLayerProps<T extends FeatureInterface> = {
    source?: IObservableArray<T>
} & Omit<MapLayerProps, 'layerType'> & ConfigProps<FeatureLayerConfig<T>>;

export class FeatureLayer<T extends FeatureInterface> extends MapLayer implements HasConfig<FeatureLayerConfig<T>> {

    readonly config: Config<FeatureLayerConfig<T>>;
    @observable.ref source: IObservableArray<T> | undefined;

    constructor(props: FeatureLayerProps<T>) {
        super({
            ...props,
            layerType: FEATURE_LAYER_ID
        });

        this.config = new Config(props);
        this.source = props.source;

        makeObservable(this);
    }

    @action
    setSource(source: IObservableArray<T> | undefined) {
        this.source = source;
    }
}
