import { IObservableArray, observable, action, makeObservable } from 'mobx';

import { Active, ActiveProps, IsActivable, IsEntity } from '@oida/state-mobx';
import { Geometry, createDynamicFactory } from '@oida/core';

export interface DatasetDiscoveryProviderItem extends IsEntity {
    geometry?: Geometry;
}

export type DatasetDiscoveryProviderProps = {
    id: string;
    providerType: string;
    name: string;
    description?: string;
} & ActiveProps;

const discoveryProviderFactory = createDynamicFactory<DatasetDiscoveryProvider>('datasetDiscoveryProviderFactory');

export abstract class DatasetDiscoveryProvider<
    T extends DatasetDiscoveryProviderItem = DatasetDiscoveryProviderItem
> implements IsActivable {

    static create<P extends DatasetDiscoveryProviderProps>(props: P) {
        const { providerType, ...config } = props;
        const provider = discoveryProviderFactory.create(providerType, config);
        if (!provider) {
            throw new Error(`DatasetDiscoveryProvider.create: Unable to create provider of type ${providerType}`);
        }
        return provider;
    }

    static register<P extends Omit<DatasetDiscoveryProviderProps, 'providerType'>, T extends DatasetDiscoveryProvider>(
        providerType: string, layerCtor: new(props: P) => T
    ) {
        discoveryProviderFactory.register(providerType, (props: P) => {
            return new layerCtor(props);
        });
    }

    readonly id: string;
    readonly type: string;
    readonly name: string;
    readonly description: string | undefined;
    readonly active: Active;
    readonly results: IObservableArray<T>;

    constructor(props: DatasetDiscoveryProviderProps) {
        this.id = props.id;
        this.type = props.providerType;
        this.name = props.name;
        this.description = props.description;

        this.active = new Active(props);
        this.results = observable.array([], {
            deep: false
        });

        makeObservable(this);
    }

    @action
    protected setResults_(results: T[]) {
        this.results.replace(results);
    }
}
