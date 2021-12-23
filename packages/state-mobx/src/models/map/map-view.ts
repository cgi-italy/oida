import { IMapProjection } from '@oidajs/core';

import { MapViewport, MapViewportProps } from './map-viewport';
import { HasConfig, Config, ConfigProps } from '../mixins';

import { makeObservable, observable, computed, action } from 'mobx';

export type MapViewConfig = {
    animateOnChange?: boolean;
};

export type MapViewProps = {
    viewport: MapViewport | MapViewportProps;
    projection?: IMapProjection;
} & ConfigProps<MapViewConfig>;

export class MapView implements HasConfig<MapViewConfig> {
    readonly config: Config<MapViewConfig>;
    @observable.ref viewport: MapViewport;
    @observable.ref projection: IMapProjection;
    @observable.ref target?: HTMLElement;
    @observable isUpdating: boolean;

    constructor(props: MapViewProps) {
        this.config = new Config(props);
        this.viewport = props.viewport instanceof MapViewport ? props.viewport : new MapViewport(props.viewport);
        this.projection = props.projection || {
            code: 'EPSG:4326'
        };
        this.target = undefined;
        this.isUpdating = false;

        makeObservable(this);
    }

    @action
    setProjection(projection: IMapProjection) {
        this.projection = projection;
    }

    @action
    setViewport(viewport: MapViewportProps) {
        this.viewport = new MapViewport(viewport);
    }

    @action
    setUpdating(updating: boolean) {
        this.isUpdating = updating;
    }

    @action
    setDomTarget(target: HTMLElement | undefined) {
        this.target = target;
    }

    @computed
    get size() {
        return this.target ? [this.target.clientWidth, this.target.clientHeight] : null;
    }
}
