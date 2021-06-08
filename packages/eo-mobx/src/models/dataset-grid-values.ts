import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import { BBoxGeometry, LoadingState, QueryFilter, SubscriptionTracker } from '@oida/core';
import { AsyncDataFetcher } from '@oida/state-mobx';

import { DatasetVariable, DatasetDimension, DataDomain, NumericDomain, CategoricalDomain, TimeSearchDirection } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';


export const GRID_VALUES_TYPE = 'grid_values';

type DimensionType = string | Date | number;

export type DatasetGridValuesRequest = {
    bbox: number[];
    variable: string;
    dimensionValues?: Map<string, DimensionType>;
    additionalDatasetFilters?: Map<string, QueryFilter>;
    gridSize?: number[];
};

export type DatasetGridValuesData = number[];

export type DatasetGridValuesProvider = (request: DatasetGridValuesRequest) => Promise<DatasetGridValuesData | undefined>;

export type DatasetGridValuesConfig = {
    variables: DatasetVariable<NumericDomain | CategoricalDomain<number>>[];
    provider: DatasetGridValuesProvider;
    dimensions: DatasetDimension<DataDomain<DimensionType>>[];
};


export type DatasetGridValuesProps = {
    variable?: string;
    autoUpdate?: boolean;
} & DatasetAnalysisProps<typeof GRID_VALUES_TYPE, DatasetGridValuesConfig> & DatasetDimensionsProps;

/**
 * A tool to extracts an array of datasets values over a uniform geographic point grid
 */
export class DatasetGridValues extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly config: DatasetGridValuesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref variable: string | undefined;
    @observable.ref data: DatasetGridValuesData | undefined;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetGridValuesData | undefined, DatasetGridValuesRequest>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetGridValuesProps, 'vizType'>) {
        super({
            vizType: GRID_VALUES_TYPE,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.variable = undefined;
        this.data = undefined;
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            },
            debounceInterval: this.autoUpdate ? 1000 : 0
        });
        this.subscriptionTracker_ = new SubscriptionTracker();
        this.needsUpdate_ = true;

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    @action
    setVariable(variable: string | undefined) {
        this.needsUpdate_ = true;
        this.variable = variable;
    }

    @action
    setAutoUpdate(autoUpdate: boolean) {
        this.autoUpdate = autoUpdate;
        if (autoUpdate) {
            this.dataFetcher_.setDebounceInterval(1000);
        } else {
            this.dataFetcher_.setDebounceInterval(0);
        }
    }

    @computed
    get canRunQuery() {
        return !!this.aoi?.geometry.value
        && this.config.dimensions.every((dim) => {
            return this.dimensions.values.has(dim.id);
        });
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.dataFetcher_.fetchData({
                    bbox: (this.aoi!.geometry.value as BBoxGeometry).bbox,
                    variable: this.variable!,
                    dimensionValues: new Map(this.dimensions.values),
                    additionalDatasetFilters: new Map(this.dataset.additionalFilters.items)
                }).then((data) => {
                    this.needsUpdate_ = false;
                    this.setData_(data);
                }).catch(() => {
                    this.setData_(undefined);
                });
            }
        } else {
            this.loadingState.setValue(LoadingState.Init);
            this.setData_(undefined);
        }
    }

    clone() {
        return this.clone_({
            config: this.config,
            variable: this.variable,
            dimensionValues: this.dimensions.values,
            autoUpdate: this.autoUpdate
        }) as DatasetGridValues;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    protected afterInit_() {

        if (!this.variable) {
            this.setVariable(this.config.variables[0].id);
        }
        if (!this.dimensions.values.has('time')) {
            //if the time dimension have not been passed in config initialize the time
            // dimension value to the current dataset selected time
            const timeDimension = this.config.dimensions.find((dimension) => dimension.id === 'time');
            if (timeDimension) {
                const datasetTime = this.dataset.toi;
                if (datasetTime) {
                    if (datasetTime instanceof Date) {
                        this.dimensions.setValue('time', datasetTime);
                    } else {
                        //a time range is currently selected. try to find the time nearest to the range end time
                        const timeProvider = this.dataset.config.timeDistribution?.provider;
                        if (timeProvider) {
                            timeProvider.getNearestItem(datasetTime.end, TimeSearchDirection.Backward).then((dt) => {
                                if (dt) {
                                    this.dimensions.setValue('time', dt.start);
                                }
                            });
                        } else {
                            this.dimensions.setValue('time', datasetTime.end);
                        }
                    }
                }
            }
        }

        const dataUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                this.retrieveData();
            }
        });

        const updateTrackerDisposer = reaction(() => {
            return {
                aoi: this.geometry,
                dimensions: new Map(this.dimensions.values)
            };
        }, () => {
            this.needsUpdate_ = true;
        });


        this.subscriptionTracker_.addSubscription(dataUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    @action
    protected setData_(data: DatasetGridValuesData | undefined) {
        this.data = data;
    }

    protected initMapLayer_() {
        return undefined;
    }
}

