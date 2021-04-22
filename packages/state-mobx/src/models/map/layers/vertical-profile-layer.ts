import { IObservableArray, observable, makeObservable, action } from 'mobx';

import { VERTICAL_PROFILE_LAYER_ID, IVerticalProfile, IVerticalProfileStyle, VerticalProfileCoordinate } from '@oida/core';

import { HasConfig, ConfigProps, Config } from '../../mixins';
import { MapLayer, MapLayerProps } from './map-layer';
import { FeatureInterface } from './feature-layer';


export type VerticalProfileGeometryGetter<T extends FeatureInterface> = (entity: T) => IVerticalProfile;
export type VerticalProfileStyleGetter<T extends FeatureInterface> = (entity: T) => IVerticalProfileStyle;


export type VerticalProfileLayerConfig<T extends FeatureInterface> = {
    profileGetter: VerticalProfileGeometryGetter<T>,
    styleGetter: VerticalProfileStyleGetter<T>
};

export type VerticalProfileLayerProps<T extends FeatureInterface> = {
    source?: IObservableArray<T>
} & MapLayerProps<typeof VERTICAL_PROFILE_LAYER_ID> & ConfigProps<VerticalProfileLayerConfig<T>>;

export class VerticalProfileLayer<T extends FeatureInterface> extends MapLayer implements HasConfig<VerticalProfileLayerConfig<T>> {
    readonly config: Config<VerticalProfileLayerConfig<T>>;
    source: IObservableArray<T> | undefined;
    @observable.ref highlightedCoordinate: VerticalProfileCoordinate | undefined;
    @observable.ref selectedCoordinate: VerticalProfileCoordinate | undefined;
    @observable.ref highlightedRegion: number[] | undefined;

    constructor(props: Omit<VerticalProfileLayerProps<T>, 'layerType'>) {
        super({
            ...props,
            layerType: VERTICAL_PROFILE_LAYER_ID
        });

        this.config = new Config(props);
        this.source = props.source;
        this.highlightedCoordinate = undefined;
        this.selectedCoordinate = undefined;
        this.highlightedRegion = undefined;

        makeObservable(this);
    }

    @action
    setSource(source: IObservableArray<T> | undefined) {
        this.source = source;
    }

    @action
    setHighlihgtedCoordinate(coord: VerticalProfileCoordinate | undefined) {
        this.highlightedCoordinate = coord;
    }

    @action
    setSelectedCoordinate(coord: VerticalProfileCoordinate | undefined) {
        this.selectedCoordinate = coord;
    }

    @action
    setHighlightedRegion(region: number[] | undefined) {
        this.highlightedRegion = region;
    }
}
