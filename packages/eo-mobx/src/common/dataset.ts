import { AoiValue, DateRangeValue, QueryFilter } from '@oidajs/core';
import { DataFilters, DataFiltersProps } from '@oidajs/state-mobx';
import { action, makeObservable, observable } from 'mobx';

import { DatasetConfig } from './dataset-config';

export type DatasetProps = {
    /** The dataset configuration object */
    config: DatasetConfig;
    /** Initial dataset area of interest */
    aoi?: AoiValue;
    /** Initial dataset time of interest */
    toi?: Date | DateRangeValue;
    /** Initial dataset additional filters */
    additionalFilters?: DataFilters | DataFiltersProps;
    onToiUpdate?: (toi: Date | DateRangeValue | undefined) => void;
};

/**
 * EO Dataset class. It keeps the {@link DatasetConfig | dataset configuration object} and a common state (aoi, toi and filters)
 * shared across all {@link DatasetViz | dataset visualizations}
 */
export class Dataset {
    /** The dataset configuration */
    readonly config: DatasetConfig;
    /** The dataset selected area of interest */
    @observable.ref aoi: AoiValue | undefined;
    /** The dataset selected time of interest */
    @observable.ref toi: Date | DateRangeValue | undefined;
    /** Any additional filter that should be shared across dataset visualizations and analyses can be specified here */
    readonly additionalFilters: DataFilters<QueryFilter>;

    protected onToiUpdate_: ((toi: Date | DateRangeValue | undefined) => void) | undefined;

    constructor(props: DatasetProps) {
        this.config = props.config;
        this.additionalFilters =
            props.additionalFilters instanceof DataFilters ? props.additionalFilters : new DataFilters(props.additionalFilters);

        this.aoi = props.aoi;
        this.toi = props.toi;

        this.onToiUpdate_ = props.onToiUpdate;

        makeObservable(this);
    }

    get id() {
        return this.config.id;
    }

    @action
    setAoi(aoi: AoiValue | undefined) {
        this.aoi = aoi;
    }

    @action
    setToi(toi: Date | DateRangeValue | undefined, silent?: boolean) {
        //avoid update on deep equality
        if (toi instanceof Date) {
            if (this.toi instanceof Date && toi.getTime() === this.toi.getTime()) {
                return;
            }
        } else if (toi) {
            if (this.toi && !(this.toi instanceof Date)) {
                if (this.toi.start.getTime() === toi.start.getTime() && this.toi.end.getTime() === toi.end.getTime()) {
                    return;
                }
            }
        }
        this.toi = toi;
        if (!silent && this.onToiUpdate_) {
            this.onToiUpdate_(toi);
        }
    }
}
