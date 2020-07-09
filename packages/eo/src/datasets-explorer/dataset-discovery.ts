import { types, Instance, addDisposer, flow } from 'mobx-state-tree';
import { reaction } from 'mobx';

import { QueryParams as QueryParamsCore } from '@oida/core';
import { hasConfig, hasAsyncData, QueryParams } from '@oida/state-mst';

import { DatasetConfig } from '../dataset';

export type DatasetDiscoveryProvider = (queryParams: QueryParamsCore) => Promise<DatasetConfig[]>;

export type DatasetDiscoveryConfig = {
    provider: DatasetDiscoveryProvider
};

const DatasetDiscoveryDecl = types.compose(
    'EODatasetDiscovery',
    types.model({
        queryParams: types.optional(QueryParams, {})
    }),
    hasAsyncData,
    hasConfig<DatasetDiscoveryConfig>()
).volatile((self) => ({
    datasets: [] as DatasetConfig[]
})
).actions((self) => ({
    searchDatasets: flow(function*() {
        try {
            self.datasets = yield self.retrieveData(() => self.config.provider(self.queryParams.data));
        } catch (e) {
            self.datasets = [];
        }
    })
})
).actions((self) => ({
    afterAttach: () => {
        let discoveryDisposer = reaction(() => self.queryParams.data, () => {
            self.searchDatasets();
        });

        addDisposer(self, () => {
            discoveryDisposer();
        });
    }
}));


type DatasetDiscoveryType = typeof DatasetDiscoveryDecl;
export interface DatasetDiscoveryInterface extends DatasetDiscoveryType {}
export const DatasetDiscovery: DatasetDiscoveryInterface = DatasetDiscoveryDecl;
export interface IDatasetDiscovery extends Instance<DatasetDiscoveryInterface> {}
