import { makeObservable, observable, action } from 'mobx';

import { createDynamicFactory, ILayerRenderer } from '@oida/core';

import { Entity, EntityProps } from '../../core';
import {
    Opacity, OpacityProps, HasOpacity,
    LoadingStatus, LoadingStatusProps, HasLoadingStatus
} from '../../mixins';

export const MAP_LAYER_TYPE = 'mapLayer';

const mapLayerFactory = createDynamicFactory<MapLayer>('mapLayerFactory');

export type MapLayerProps = {
    name?: string;
    zIndex?: number;
    extent?: number[];
    layerType: string;
} & Omit<EntityProps, 'entityType'> & OpacityProps & LoadingStatusProps;

export class MapLayer extends Entity implements HasOpacity, HasLoadingStatus {

    static create(props: MapLayerProps & Record<string, any>) {
        const { layerType, ...config } = props;
        const mapLayer = mapLayerFactory.create(layerType, config);
        if (!mapLayer) {
            throw new Error(`Unable to create layer of type ${layerType}`);
        }
        return mapLayer;
    }

    static register<P extends Omit<MapLayerProps, 'layerType'>>(layerType: string, layerCtor: new(props: P) => MapLayer) {
        mapLayerFactory.register(layerType, (props: P) => {
            return new layerCtor(props);
        });
    }

    readonly layerType: string;
    readonly opacity: Opacity;
    readonly loadingStatus: LoadingStatus;
    @observable name: string;
    @observable zIndex: number;
    @observable.ref extent: number[] | undefined;
    @observable.ref renderer: ILayerRenderer | undefined;

    constructor(props: MapLayerProps) {
        super({
            ...props,
            entityType: MAP_LAYER_TYPE
        });
        this.layerType = props.layerType;
        this.opacity = new Opacity(props);
        this.loadingStatus = new LoadingStatus(props);

        this.name = props.name || '';
        this.zIndex = props.zIndex || 0;
        this.extent = props.extent;
        this.renderer = undefined;

        makeObservable(this);
    }

    @action
    setName(name: string) {
        this.name = name;
    }

    @action
    setZIndex(zIndex: number) {
        this.zIndex = zIndex;
    }

    @action
    setExtent(extent: number[] | undefined) {
        this.extent = extent;
    }

    @action
    setRenderer(renderer: ILayerRenderer | undefined) {
        this.renderer = renderer;
    }

}
