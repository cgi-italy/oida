import { AoiValue, DateRangeValue } from '@oida/core';
import { DataFilters, DataFiltersProps } from '@oida/state-mobx';

import { DatasetConfig } from '../types/dataset-config';


export const DATASET_AOI_FILTER_KEY = 'dataset_aoi';
export const DATASET_TIME_RANGE_FILTER_KEY = 'dataset_time_range';
export const DATASET_SELECTED_TIME_FILTER_KEY = 'dataset_selected_time';

export type DatasetProps = {
    filters?: DataFilters | DataFiltersProps,
    config: DatasetConfig
};

export class Dataset {

    readonly filters: DataFilters;
    readonly config: DatasetConfig;

    constructor(props: DatasetProps) {
        this.config = props.config;
        this.filters = props.filters instanceof DataFilters ? props.filters : new DataFilters(props.filters);
    }

    get id() {
        return this.config.id;
    }

    get aoiFilter() : AoiValue | undefined {
        return this.filters.get(DATASET_AOI_FILTER_KEY)?.value;
    }

    get timeRangeFilter() : DateRangeValue | undefined {
        return this.filters.get(DATASET_TIME_RANGE_FILTER_KEY)?.value;
    }

    get selectedTime() : Date | DateRangeValue | undefined {
        let selectedTime = this.filters.get(DATASET_SELECTED_TIME_FILTER_KEY)?.value;
        if (!selectedTime) {
            selectedTime = this.filters.get(DATASET_TIME_RANGE_FILTER_KEY)?.value;
        }
        return selectedTime;
    }
}
