import { IObservableArray, observable, action, makeObservable, IReactionDisposer, reaction } from 'mobx';
import { FeatureLayer, FeatureStyleGetter } from '@oidajs/state-mobx';

import {
    DatasetDiscoveryProvider,
    DatasetDiscoveryProviderDefinition,
    DatasetDiscoveryProviderDefinitions,
    DatasetDiscoveryProviderItem
} from './dataset-discovery-provider';

const pointIcon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAuJAAALiQE3ycutAAAAB3RJTUUH5AEcFScmdItkoAAABF9JREFUeNrt3c1rFVcYx/HfEwULUlOJt7ShKilaKA3SQqmgFLusSnFjESG+/QOFuCwICnGhCzfuuuq+a7PooosiWN+K76VvCTR1YyIa3cRuni4ywiWKnpk75945Z76fjYmezHNynmfOzLn33NGUKXeXmT3/eq+kzyV9JOlDSe9JWrPiR55J+lfSb5LuSvrJzH5ceSykUwD73H3aezft7nsY0QTO+OLPA+4+7/V74O4HumOhQcl392F3v+bxXStiMfANKoAvvP92MfLNSP4xH5wJMjDY5O/2wdud8hhaoomXpC2S/qzw408l/SDphqRHxd+tl/SxpK8lvVnhmFsl/cVSsb9FsFjyTL3i7jtXrhpe8vXOom0Zi2Skv8k/UzJB+0OXb13Lyf0lY5whM/1Z7nVKJGXJ3Ud7iDdaHCNUh+Vh/CL4vkRCRt3deohl7r65RLzvyFD8Agh1uMaYh0ODkqG40//RwDzcjhD/78DYR6mDeEVwMXRtXmcSiuL7KjD2RV4HiDj9B/1SkRbkg44fw1BCyf80sOl0xG5M19xXCiB0Cpa0I7D5rxG7cj2w3Y5U7gOSKIBiRh0PbH4/YlfmA9uNp3IVSOYSIOmDwHZrI/Zhbc19pQBK2BDY7t2IfRgJbDdMAdTvncB2n0Tsw/bAdptYBtZ/I7gQegYOehko6aGZbWAGGFBf3f1IhOQfyXRck5kBfi6zgzdC/Acl4v/CPUD97pRo23H3qRqTPyWpE+H1AgQmQO4+MYj9ehX3HU7whlD9RTDS702b7v5lxZgjZCxOEcxWTMi5CrHOVYw1S6biFcDpHrZvL7n7pLuvWnFp6T7+qqLNUg9xTqc0pqm9HdyRVMcd/h9a3hb+/MZyXMvbwut4CfdtM5unAOIVwWVJnzW0e1fMbHtK4zmUWPIl6WyDu3g2tbv/VD8ZtKQXH/AwaP+Z2ZrUxjLVlyynGtinEykOZLIfZmvaFmxL9IOBKb9pcYq+tHgGaNIsYAl/LDj1ty1P0YcWzwBNmAUs8YcC5LBx4ZuWxmYG6JoF5hW+abQuC2bWSX3sctm6dKwlMfGKWeBqHx8MdTWXccvlEiBJGyX906eQmyTN5fBQqCwuAWYmM5uTdL4P4c6b2VwuTwTL7rlmkd8oemZmb+Q0XkOZJV+SDkUMcYjNnmkUwqUIN36XchyrHC8B0vJHyBZqPvSwpCe5PQ00u48wFTeEDyUdr/Gwx83sCY+CTW82mKlh6v895zGyjJMvSWOSZno81PuSZjn70y2Ekz2c/ScZwfZeCmYYuUwuBe4+VqEAxljz51UIkyWSP8mI5VkE9wKSf7NNY2ItSr4krZP0uv/d4y1Ji9z151sIB19x9h9khNpRBBdekvwLjEx7LgVy98ddyX/c/W9ox9JwW1cBbGtr8le38ZcubvBuufu3xfe3OC0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBV/wM1KMOVyuaRJwAAAABJRU5ErkJggg==';

// default style for discovery items
export const defaultDiscoveryFootprintStyle: FeatureStyleGetter<DatasetDiscoveryProviderItem> = (entity: DatasetDiscoveryProviderItem) => {
    let color: [number, number, number] = [0, 0, 0.6];
    let opacity = 0.1;

    if (entity.selected.value) {
        color = [1.0, 1.0, 0.0];
        opacity = 0.4;
    } else if (entity.hovered.value) {
        color = [0, 0, 1];
        opacity = 0.2;
    }

    let zIndex = 0;
    if (entity.selected.value) {
        zIndex = 1;
    }
    if (entity.hovered.value) {
        zIndex = 2;
    }

    return {
        point: {
            visible: entity.visible.value,
            url: pointIcon,
            scale: 0.5,
            color: color,
            zIndex: zIndex
        },
        polygon: {
            visible: entity.visible.value,
            strokeColor: color,
            strokeWidth: entity.selected.value ? 3 : 2,
            fillColor: [...color, opacity],
            zIndex: zIndex
        }
    };
};

export type DatasetDiscoveryProps = {
    providers?: (DatasetDiscoveryProvider | DatasetDiscoveryProviderDefinitions[keyof DatasetDiscoveryProviderDefinitions])[];
    footprintStyle?: FeatureStyleGetter<DatasetDiscoveryProviderItem>;
};

/**
 * Main state class for EO dataset discovery. It manages a list of {@link DatasetDiscoveryProvider} and display the results of the
 * currently selected provider in a map vector layer (when the provider {@link DatasetDiscoveryProviderItem} geometry field is available).
 * The {@link DatasetDiscoveryProvider} is responsible for implementing the dataset retrieval logic, and should be able
 * to generate a {@link DatasetConfig} from each {@link DatasetDiscoveryProviderItem} record.
 * Such configuration object can then be used in the {@link DatasetExplorer.addDataset} method to add the dataset to the analysis.
 */
export class DatasetDiscovery {
    /** The observable list of discovery providers */
    providers: IObservableArray<DatasetDiscoveryProvider>;
    /** The currently selected provider */
    @observable.ref selectedProvider: DatasetDiscoveryProvider | undefined;
    /** A vector layer that shows the footprints of the currently selected provider records */
    readonly footprintLayer: FeatureLayer<DatasetDiscoveryProviderItem>;

    protected readonly footprintStyle_: FeatureStyleGetter<DatasetDiscoveryProviderItem>;
    protected providerUpdaterDisposer_: IReactionDisposer | undefined;

    constructor(props?: DatasetDiscoveryProps) {
        this.providers = observable.array([], {
            deep: false
        });

        this.footprintStyle_ = props?.footprintStyle || defaultDiscoveryFootprintStyle;
        this.footprintLayer = new FeatureLayer({
            id: 'dataset-discovery-footprints',
            config: {
                styleGetter: this.footprintStyle_,
                geometryGetter: (item) => item.geometry
            }
        });

        this.selectedProvider = undefined;

        makeObservable(this);

        if (props?.providers) {
            this.addProviders(props?.providers);
        }
    }

    /**
     * Retrieve a dataset discovery provider instance from its identifier
     * @param id The provider identifier
     * @return The provider instance with identifier id
     */
    getProvider(id: string) {
        return this.providers.find((provider) => provider.id === id);
    }

    /**
     * Set the active provider
     *
     * @param provider the provider to be activated
     * @returns
     * @memberof DatasetDiscovery
     */
    @action
    selectProvider(provider: DatasetDiscoveryProvider | string | undefined) {
        const providerInstance = typeof provider === 'string' ? this.getProvider(provider) : provider;

        if (providerInstance === this.selectedProvider) {
            return;
        }

        if (this.providerUpdaterDisposer_) {
            this.providerUpdaterDisposer_();
            this.providerUpdaterDisposer_ = undefined;
        }

        if (this.selectedProvider) {
            this.selectedProvider.active.setValue(false);
        }

        this.selectedProvider = providerInstance;
        if (providerInstance) {
            providerInstance.active.setValue(true);

            // enable display of selected provider results footprints on the map
            // wrapped in a reaction to allow the provider to dynamically update the results
            // array reference and the feature styling
            this.providerUpdaterDisposer_ = reaction(
                () => {
                    return {
                        source: providerInstance.results,
                        styleGetter: providerInstance.mapFeatureStyler
                    };
                },
                (layerData) => {
                    this.footprintLayer.setSource(layerData.source);
                    if (layerData.styleGetter) {
                        this.footprintLayer.config.updateConfig({
                            styleGetter: layerData.styleGetter
                        });
                    } else {
                        this.footprintLayer.config.updateConfig({
                            styleGetter: this.footprintStyle_
                        });
                    }
                },
                {
                    fireImmediately: true
                }
            );
        } else {
            this.footprintLayer.setSource(undefined);
        }
    }

    /**
     * Add one or more dataset provider
     *
     * @template TYPE
     * @param providers
     */
    @action
    addProviders<TYPE extends string = keyof DatasetDiscoveryProviderDefinitions>(
        providers: (DatasetDiscoveryProvider | DatasetDiscoveryProviderDefinition<TYPE>)[]
    ) {
        const instances = providers.map((provider) => {
            if (provider instanceof DatasetDiscoveryProvider) {
                provider.active.setValue(false);
                return provider;
            } else {
                return DatasetDiscoveryProvider.create(provider.providerType, {
                    ...provider,
                    active: false
                });
            }
        });
        this.providers.push(...instances);
    }
}
