import { IObservableArray, observable, action, makeObservable } from 'mobx';

import { Active, ActiveProps, FeatureStyleGetter, IsActivable, IsEntity } from '@oida/state-mobx';
import { Geometry, createDynamicFactory } from '@oida/core';

import { DatasetConfig } from '../common';
import { DatasetExplorerItemInitialState } from '../dataset-explorer';

export interface DatasetDiscoveryProviderItem extends IsEntity {
    geometry?: Geometry;
}

export type DatasetDiscoveryProviderProps<TYPE extends string = string> = {
    id: string;
    providerType: TYPE;
    name: string;
    description?: string;
    disabled?: boolean;
} & ActiveProps;

export interface DatasetDiscoveryProviderDefinitions {
}
export interface DatasetDiscoveryProviderTypes {
}

export type DatasetDiscoveryProviderDefinition<TYPE extends string = keyof DatasetDiscoveryProviderDefinitions> =
    TYPE extends keyof DatasetDiscoveryProviderDefinitions
        ? DatasetDiscoveryProviderDefinitions[TYPE]
        : (DatasetDiscoveryProviderProps<TYPE> & Record<string, any>);

export type DatasetDiscoveryProviderType<TYPE extends string> =
    TYPE extends keyof DatasetDiscoveryProviderTypes
        ? DatasetDiscoveryProviderTypes[TYPE]
        : DatasetDiscoveryProvider;


const discoveryProviderFactory = createDynamicFactory<
    DatasetDiscoveryProvider
>('datasetDiscoveryProviderFactory');


/**
 * A class to manage the state of an EO dataset discovery provider.
 * Inherited classes shall implement the data retrieval logic and populate
 * the {@Link DatasetDiscoveryProvider.results_} array
 *
 * Example:
 *
 * ```
 * // define a unique type identifier for the provider
 * const MY_DISCOVERY_PROVIDER_TYPE = 'my-provider'
 * // define the provider discovery item type
 * type MyDiscoveryProviderItemType = {
 *     dummyProp: string;
 *     geometry: Geometry;
 * };
 * // define the provider configuration type
 * type MyDiscoveryProviderProps = DatasetDiscoveryProviderProps<typeof MY_DISCOVERY_PROVIDER_TYPE> & {
 *    providerProp1: string
 * }
 * // define the new provider
 * class MyDiscoveryPrvider extends DatasetDiscoveryProvider<MyDiscoveryProviderItemType> {
 *    constructor(props: Omit<MyDiscoveryProviderProps, 'providerType'>) {
 *        super({
 *            providerType: MY_DISCOVERY_PROVIDER_TYPE,
 *            ...props
 *        })
 *    }
 * }
 *
 * // Optionally if there is the need to create a provider instance
 * // from a configuration object the following steps should be implemented
 *
 * // declaration merging to register the provider configuration and type (this is required for typings)
 * declare module '@oida/eo-mobx' {
 *     interface DatasetDiscoveryProviderDefinitions {
 *         [MY_DISCOVERY_PROVIDER_TYPE]: MyDiscoveryProviderProps;
 *     }
 *
 *     interface DatasetDiscoveryProviderTypes {
 *         [MY_DISCOVERY_PROVIDER_TYPE]: MyDiscoveryPrvider;
 *     }
 * }
 *
 * // registration of the new type
 * DatasetDiscoveryProvider.register(MY_DISCOVERY_PROVIDER_TYPE, MyDiscoveryPrvider);
 *
 * // Now we can create an instance of the new provider
 * DatasetDiscoveryProvider.create(MY_DISCOVERY_PROVIDER_TYPE, {
 *     id: 'my_provider_instance',
 *     providerProp1: 'test'
 * })
 * ```
 *
 * @template T the provider dataset record type
 */
export abstract class DatasetDiscoveryProvider<
    T extends DatasetDiscoveryProviderItem = DatasetDiscoveryProviderItem
> implements IsActivable {

    /**
     * Create a dataset discovery provider instance given a configuration object
     * @template P The provider specific configuration object type
     * @param props The provider configuration
     * @returns The dataset discovery provider instance or undefined if no provider with the provided type was registered
     */
    static create<
        TYPE extends string
    >(
        providerType: TYPE, props: Omit<DatasetDiscoveryProviderDefinition<TYPE>, 'providerType'>
    ) {

        const provider = discoveryProviderFactory.create(providerType, props);
        if (!provider) {
            throw new Error(`DatasetDiscoveryProvider.create: Unable to create provider of type ${providerType}`);
        }
        return provider as DatasetDiscoveryProviderType<TYPE>;
    }

    /**
     * Register a dataset discovery provider type for factory creation thorugh {@Link DatasetDiscoveryProvider.create}
     * @param providerType The unique discovery provider type identifier
     * @param providerCtor The provider constructor
     */
    static register<
        TYPE extends string,
        P extends DatasetDiscoveryProvider,
        PROPS extends Omit<DatasetDiscoveryProviderProps, 'providerType'> = DatasetDiscoveryProviderDefinition<TYPE>
    >(
        providerType: TYPE, providerCtor: new(
            props: PROPS
        ) => P
    ) {
        discoveryProviderFactory.register(providerType, (props) => {
            return new providerCtor(props);
        });
    }

    /** The provider identifier */
    readonly id: string;
    /** The provider type identifier */
    readonly type: string;
    /** The provider name */
    readonly name: string;
    /** The provider description */
    readonly description: string | undefined;
    /** Indicate if the provider is currently active (e.g. enable data retrieval).
     * It is usually set by the {@Link DatasetDiscovery} based on the currently selected provider
     **/
    readonly active: Active;

    /** The disabled state of the provider. When disabled a provider will not be visible or selectable*/
    @observable disabled: boolean;

    /**
     * The results datasets array. Its population is responsability of the inherited class
     */
    @observable.ref protected results_: IObservableArray<T>;
    /**
     * A default feature style is used to draw the discovery items geometries on the map
     * Define this in the derived class to customize items representation on the map
     */
    @observable.ref protected mapFeatureStyler_: FeatureStyleGetter<DatasetDiscoveryProviderItem> | undefined;

    constructor(props: DatasetDiscoveryProviderProps) {
        this.id = props.id;
        this.type = props.providerType;
        this.name = props.name;
        this.description = props.description;

        this.active = new Active(props);
        this.disabled = props.disabled || false;

        this.results_ = observable.array([], {
            deep: false
        });
        this.mapFeatureStyler_ = undefined;

        makeObservable(this);
    }

    /**
     * create the dataset configuration for a specific item
     */
    abstract createDataset(item: T): Promise<(DatasetConfig & {initialState?: DatasetExplorerItemInitialState}) | undefined>;


    @action
    setDisabled(disabled: boolean) {
        this.disabled = disabled;
    }

    get results() {
        return this.results_;
    }

    get mapFeatureStyler() {
        return this.mapFeatureStyler_;
    }

    @action
    protected setResults_(results: T[]) {
        this.results.replace(results);
    }
}
