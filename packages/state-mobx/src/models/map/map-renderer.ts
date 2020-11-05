import { IMapRenderer } from '@oida/core';
import { makeObservable, observable, action } from 'mobx';

export type MapRendererProps = {
    id: string;
    options?: any
};


export class MapRenderer {
    id: string;
    options: any;
    implementation: IMapRenderer | undefined;

    constructor(props: MapRendererProps) {
        this.id = props.id;
        this.options = props.options;
        this.implementation = undefined;

        makeObservable(this, {
            options: observable.ref,
            implementation: observable.ref,
            setImplementation: action
        });
    }

    setOptions(options: Partial<any>) {
        this.options = {
            ...this.options,
            ...options
        };
    }

    setImplementation(implementation: IMapRenderer | undefined) {
        this.implementation = implementation;
    }
}
