import { DatasetDiscoveryProvider } from '../dataset-discovery';

import { DatasetConfig } from '../../dataset';

export const createFixedDatasetsProvider = (datasets: DatasetConfig[]) => {
    return (() => {
        return Promise.resolve(datasets);
    }) as DatasetDiscoveryProvider;
};
