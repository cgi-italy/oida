import { types, Instance } from 'mobx-state-tree';

import { AoiValue, DateRangeValue } from '@oida/core';
import { hasConfig, QueryParams } from '@oida/state-mst';

import { DatasetConfig } from './dataset-config';

export const DATASET_AOI_FILTER_KEY = 'dataset_aoi';
export const DATASET_TIME_RANGE_FILTER_KEY = 'dataset_time_range';
export const DATASET_SELECTED_TIME_FILTER_KEY = 'dataset_selected_time';

const DatasetDecl = types.compose(
    'EODataset',
    types.model({
        id: types.identifier,
        searchParams: QueryParams
    }).views((self) => {
        return {
            get aoiFilter() : AoiValue | undefined {
                return self.searchParams.filters.get(DATASET_AOI_FILTER_KEY);
            },
            get timeRangeFilter() : DateRangeValue | undefined {
                return self.searchParams.filters.get(DATASET_TIME_RANGE_FILTER_KEY);
            },
            get selectedTime() : Date | DateRangeValue | undefined {
                let selectedTime = self.searchParams.filters.get(DATASET_SELECTED_TIME_FILTER_KEY);
                if (!selectedTime) {
                    selectedTime = self.searchParams.filters.get(DATASET_TIME_RANGE_FILTER_KEY);
                }
                return selectedTime;
            }
        };
    }),
    hasConfig<DatasetConfig>()
);

type DatasetType = typeof DatasetDecl;
export interface DatasetInterface extends DatasetType {}
export const Dataset: DatasetInterface = DatasetDecl;
export interface IDataset extends Instance<DatasetInterface> {}
