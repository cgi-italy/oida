import { AoiValue, DateRangeValue, DATE_FIELD_ID } from '@oida/core';
import { DataFilters, DataFiltersProps } from '@oida/state-mobx';

import { DatasetConfig } from '../types/dataset-config';


export const DATASET_AOI_FILTER_KEY = 'dataset_aoi';
export const DATASET_TIME_RANGE_FILTER_KEY = 'dataset_time_range';
export const DATASET_SELECTED_TIME_FILTER_KEY = 'dataset_selected_time';

export type DatasetProps = {
    filters?: DataFilters | DataFiltersProps,
    config: DatasetConfig,
    onSelectedDateUpdate?: (dt: Date) => void;
};

export class Dataset {

    readonly filters: DataFilters;
    readonly config: DatasetConfig;

    protected onSelectedDateUpdate_: ((dt: Date) => void) | undefined;

    constructor(props: DatasetProps) {
        this.config = props.config;
        this.filters = props.filters instanceof DataFilters ? props.filters : new DataFilters(props.filters);
        this.onSelectedDateUpdate_ = props.onSelectedDateUpdate;
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

    /**
     * Update the dataset selected date.
     * Use this instead of updating the filters directly if the onSelectedDateUpdate shall be called
     * @param dt The dataset selected date
     */
    setSelectedDate(dt: Date) {
        const currentDate = this.filters.get(DATASET_SELECTED_TIME_FILTER_KEY)?.value;
        if (!currentDate || currentDate.getTime() !== dt.getTime()) {
            this.filters.set(DATASET_SELECTED_TIME_FILTER_KEY, dt, DATE_FIELD_ID);
            if (this.onSelectedDateUpdate_) {
                this.onSelectedDateUpdate_(dt);
            }
        }
    }
}
