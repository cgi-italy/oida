import { makeObservable, observable, action } from 'mobx';

export type ConfigProps<T extends Record<string, any>> = {
    config: T
};

export class Config<T extends Record<string, any>> {
    @observable.ref value: T;

    constructor(props: ConfigProps<T>) {
        this.value = props.config;

        makeObservable(this);
    }

    @action
    updateConfig(config: Partial<T>) {
        this.value = {
            ...this.value,
            ...config
        };
    }
}

export interface HasConfig<T extends Record<string, any>> {
    config: Config<T>;
}
