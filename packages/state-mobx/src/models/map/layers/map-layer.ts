import { makeObservable, observable, action } from 'mobx';

import { createDynamicFactory, IMapLayerRenderer } from '@oida/core';

import { Entity, EntityProps } from '../../core';
import {
    Opacity, OpacityProps, HasOpacity,
    LoadingStatus, LoadingStatusProps, HasLoadingStatus
} from '../../mixins';

export const MAP_LAYER_TYPE = 'mapLayer';

export interface MapLayerDefinitions {}
export interface MapLayerTypes {}
export type MapLayerDefinition<TYPE extends keyof MapLayerDefinitions = keyof MapLayerDefinitions> = MapLayerDefinitions[TYPE];
export type MapLayerType<TYPE extends keyof MapLayerTypes> = MapLayerTypes[TYPE];

const mapLayerFactory = createDynamicFactory<
    MapLayer,
    MapLayerDefinitions
>('datasetDiscoveryProviderFactory');

export type MapLayerProps<TYPE extends string = string> = {
    name?: string;
    zIndex?: number;
    extent?: number[];
    layerType: TYPE;
} & Omit<EntityProps, 'entityType'> & OpacityProps & LoadingStatusProps;

export class MapLayer extends Entity implements HasOpacity, HasLoadingStatus {

    static create<TYPE extends keyof MapLayerDefinitions>(props: MapLayerDefinition<TYPE>): MapLayerType<TYPE> {
        const mapLayer = mapLayerFactory.create(props.layerType, props);
        if (!mapLayer) {
            throw new Error(`Unable to create layer of type ${props.layerType}`);
        }
        return mapLayer as MapLayerType<TYPE>;
    }

    static register<TYPE extends keyof MapLayerDefinitions, L extends MapLayer>(
        layerType: TYPE,
        layerCtor: new(props: Omit<MapLayerDefinition<TYPE>, 'layerType'>) => L
    ) {
        mapLayerFactory.register(layerType, (props) => {
            return new layerCtor(props);
        });
    }

    readonly layerType: string;
    readonly opacity: Opacity;
    readonly loadingStatus: LoadingStatus;
    @observable name: string;
    @observable zIndex: number;
    @observable.ref extent: number[] | undefined;
    @observable.ref renderer: IMapLayerRenderer | undefined;

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
    setRenderer(renderer: IMapLayerRenderer | undefined) {
        this.renderer = renderer;
    }

}
