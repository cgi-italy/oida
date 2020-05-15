import { types, Instance, addDisposer, flow } from 'mobx-state-tree';
import { reaction } from 'mobx';

import { QueryParams as QueryParamsCore, CancelablePromise } from '@oida/core';
import { hasConfig, QueryParams } from '@oida/state-mst';

import { isDataProvider } from './is-data-provider';
import { DatasetConfig } from '../dataset';

export type DatasetDiscoveryProvider = (queryParams: QueryParamsCore) => CancelablePromise<DatasetConfig[]>;

export type DatasetDiscoveryConfig = {
    provider: DatasetDiscoveryProvider
};

const DatasetDiscoveryDecl = types.compose(
    'EODatasetDiscovery',
    types.model({
        queryParams: types.optional(QueryParams, {})
    }),
    isDataProvider,
    hasConfig<DatasetDiscoveryConfig>()
).volatile((self) => ({
    datasets: [] as DatasetConfig[]
})
).actions((self) => ({
    searchDatasets: flow(function*() {
        try {
            self.datasets = yield self.startDataRequest(self.config.provider(self.queryParams.data));
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
