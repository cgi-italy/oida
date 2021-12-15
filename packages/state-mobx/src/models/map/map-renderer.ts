import { IMapRenderer } from '@oidajs/core';
import { makeObservable, observable, action } from 'mobx';

export type MapRendererOptions = Record<string, any>;

export type MapRendererProps = {
    id: string;
    options?: MapRendererOptions
};


export class MapRenderer {
    id: string;
    @observable.ref options: MapRendererOptions;
    @observable.ref implementation: IMapRenderer | undefined;

    constructor(props: MapRendererProps) {
        this.id = props.id;
        this.options = props.options || {};
        this.implementation = undefined;

        makeObservable(this);
    }

    @action
    setOptions(options: Partial<MapRendererOptions>) {
        this.options = {
            ...this.options,
            ...options
        };
    }

    @action
    setImplementation(implementation: IMapRenderer | undefined) {
        this.implementation = implementation;
    }
}
