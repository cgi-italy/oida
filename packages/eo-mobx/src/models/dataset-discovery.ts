import { IObservableArray, observable, action, makeObservable } from 'mobx';
import { FeatureLayer, FeatureStyleGetter } from '@oida/state-mobx';

import { DatasetDiscoveryProvider, DatasetDiscoveryProviderItem, DatasetDiscoveryProviderProps } from './dataset-discovery-provider';
import { Color } from '@oida/core';

const datasetDiscoveryStyleGetter: FeatureStyleGetter<DatasetDiscoveryProviderItem> =
(entity: DatasetDiscoveryProviderItem) => {

    let color = [0, 0, 0.6];
    let opacity = 0.2;

    if (entity.selected) {
        color = [1.0, 1.0, 0.0];
        opacity = 0.6;
    } else if (entity.hovered) {
        color = [0, 0, 1];
        opacity = 0.4;
    }

    return {
        polygon: {
            visible: entity.visible.value,
            strokeColor: color as Color,
            strokeWidth: entity.selected.value ? 3 : 2,
            fillColor: [...color, opacity] as Color,
            zIndex: entity.selected.value ? 1 : 0
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
                geometryGetter: (item) => item.footprint
            }
        });

        this.selectedProvider = undefined;

        makeObservable(this);

        if (props?.providers) {
            this.addProviders(props?.providers);
        }
    }

    @action
    selectProvider(provider: DatasetDiscoveryProvider | string | undefined) {
        const providerInstance = typeof(provider) === 'string' ? this.providers.find(item => item.id === provider) : provider;

        this.selectedProvider = providerInstance;
        if (providerInstance) {
            this.footprintLayer.setSource(providerInstance.results);
        } else {
            this.footprintLayer.setSource(undefined);
        }
    }

    @action
    addProviders<P extends DatasetDiscoveryProviderProps>(providers: (DatasetDiscoveryProvider | P)[]) {
        const instances = providers.map(provider => {
            return provider instanceof DatasetDiscoveryProvider ? provider : DatasetDiscoveryProvider.create(provider);
        });
        this.providers.push(...instances);
    }
}

