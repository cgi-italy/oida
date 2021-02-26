import { IObservableArray, observable, action, makeObservable } from 'mobx';
import { FeatureLayer, FeatureStyleGetter } from '@oida/state-mobx';

import { DatasetDiscoveryProvider, DatasetDiscoveryProviderItem, DatasetDiscoveryProviderProps } from './dataset-discovery-provider';
import { Color } from '@oida/core';

const pointIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAuJAAALiQE3ycutAAAAB3RJTUUH5AEcFScmdItkoAAABF9JREFUeNrt3c1rFVcYx/HfEwULUlOJt7ShKilaKA3SQqmgFLusSnFjESG+/QOFuCwICnGhCzfuuuq+a7PooosiWN+K76VvCTR1YyIa3cRuni4ywiWKnpk75945Z76fjYmezHNynmfOzLn33NGUKXeXmT3/eq+kzyV9JOlDSe9JWrPiR55J+lfSb5LuSvrJzH5ceSykUwD73H3aezft7nsY0QTO+OLPA+4+7/V74O4HumOhQcl392F3v+bxXStiMfANKoAvvP92MfLNSP4xH5wJMjDY5O/2wdud8hhaoomXpC2S/qzw408l/SDphqRHxd+tl/SxpK8lvVnhmFsl/cVSsb9FsFjyTL3i7jtXrhpe8vXOom0Zi2Skv8k/UzJB+0OXb13Lyf0lY5whM/1Z7nVKJGXJ3Ud7iDdaHCNUh+Vh/CL4vkRCRt3deohl7r65RLzvyFD8Agh1uMaYh0ODkqG40//RwDzcjhD/78DYR6mDeEVwMXRtXmcSiuL7KjD2RV4HiDj9B/1SkRbkg44fw1BCyf80sOl0xG5M19xXCiB0Cpa0I7D5rxG7cj2w3Y5U7gOSKIBiRh0PbH4/YlfmA9uNp3IVSOYSIOmDwHZrI/Zhbc19pQBK2BDY7t2IfRgJbDdMAdTvncB2n0Tsw/bAdptYBtZ/I7gQegYOehko6aGZbWAGGFBf3f1IhOQfyXRck5kBfi6zgzdC/Acl4v/CPUD97pRo23H3qRqTPyWpE+H1AgQmQO4+MYj9ehX3HU7whlD9RTDS702b7v5lxZgjZCxOEcxWTMi5CrHOVYw1S6biFcDpHrZvL7n7pLuvWnFp6T7+qqLNUg9xTqc0pqm9HdyRVMcd/h9a3hb+/MZyXMvbwut4CfdtM5unAOIVwWVJnzW0e1fMbHtK4zmUWPIl6WyDu3g2tbv/VD8ZtKQXH/AwaP+Z2ZrUxjLVlyynGtinEykOZLIfZmvaFmxL9IOBKb9pcYq+tHgGaNIsYAl/LDj1ty1P0YcWzwBNmAUs8YcC5LBx4ZuWxmYG6JoF5hW+abQuC2bWSX3sctm6dKwlMfGKWeBqHx8MdTWXccvlEiBJGyX906eQmyTN5fBQqCwuAWYmM5uTdL4P4c6b2VwuTwTL7rlmkd8oemZmb+Q0XkOZJV+SDkUMcYjNnmkUwqUIN36XchyrHC8B0vJHyBZqPvSwpCe5PQ00u48wFTeEDyUdr/Gwx83sCY+CTW82mKlh6v895zGyjJMvSWOSZno81PuSZjn70y2Ekz2c/ScZwfZeCmYYuUwuBe4+VqEAxljz51UIkyWSP8mI5VkE9wKSf7NNY2ItSr4krZP0uv/d4y1Ji9z151sIB19x9h9khNpRBBdekvwLjEx7LgVy98ddyX/c/W9ox9JwW1cBbGtr8le38ZcubvBuufu3xfe3OC0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBV/wM1KMOVyuaRJwAAAABJRU5ErkJggg==';


const datasetDiscoveryStyleGetter: FeatureStyleGetter<DatasetDiscoveryProviderItem> =
(entity: DatasetDiscoveryProviderItem) => {

    let color = [0, 0, 0.6];
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
            strokeColor: color as Color,
            strokeWidth: entity.selected.value ? 3 : 2,
            fillColor: [...color, opacity] as Color,
            zIndex: zIndex
        }
    };
};

export type DatasetDiscoveryProps = {
    providers?: (DatasetDiscoveryProvider | DatasetDiscoveryProviderProps & Record<string, any>)[]
};

export class DatasetDiscovery {
    providers: IObservableArray<DatasetDiscoveryProvider>;
    @observable.ref selectedProvider: DatasetDiscoveryProvider | undefined;
    readonly footprintLayer: FeatureLayer<DatasetDiscoveryProviderItem>;

    constructor(props?: DatasetDiscoveryProps) {
        this.providers = observable.array([], {
            deep: false
        });

        this.footprintLayer = new FeatureLayer({
            id: 'dataset-discovery-footprints',
            config: {
                styleGetter: datasetDiscoveryStyleGetter,
                geometryGetter: (item) => item.geometry
            }
        });

        this.selectedProvider = undefined;

        makeObservable(this);

        if (props?.providers) {
            this.addProviders(props?.providers);
        }
    }

    getProvider(id: string) {
        return this.providers.find(provider => provider.id === id);
    }

    @action
    selectProvider(provider: DatasetDiscoveryProvider | string | undefined) {
        const providerInstance = typeof(provider) === 'string' ? this.getProvider(provider) : provider;

        if (providerInstance === this.selectedProvider) {
            return;
        }

        if (this.selectedProvider) {
            this.selectedProvider.active.setValue(false);
        }

        this.selectedProvider = providerInstance;
        if (providerInstance) {
            providerInstance.active.setValue(true);
            this.footprintLayer.setSource(providerInstance.results);
        } else {
            this.footprintLayer.setSource(undefined);
        }
    }


    @action
    addProviders<P extends DatasetDiscoveryProviderProps>(providers: (DatasetDiscoveryProvider | P)[]) {
        const instances = providers.map(provider => {
            if (provider instanceof DatasetDiscoveryProvider) {
                provider.active.setValue(false);
                return provider;
            } else {
                return DatasetDiscoveryProvider.create({
                    ...provider,
                    active: false
                });
            }
        });
        this.providers.push(...instances);
    }
}

