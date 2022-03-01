import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import { LoadingState, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';

import {
    DatasetDimension,
    DataDomain,
    DomainRange,
    isValueDomain,
    NumericVariable,
    DatasetDimensions,
    HasDatasetDimensions,
    DatasetDimensionsProps
} from '../common';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';

export const POINT_SERIES_PROCESSING = 'point_series_processing';

type SeriesDimensionType = string | Date | number;

export type DatasetPointSeriesRequest<T = SeriesDimensionType> = {
    dimension: string;
    range?: DomainRange<T>;
    dimensionValues?: Map<string, SeriesDimensionType>;
    variable: string;
    location: GeoJSON.Point;
};

export type DatasetPointSeriesValueItem<T = SeriesDimensionType> = {
    x: T;
    y: number;
};

export type DatasetPointSeriesData<T = SeriesDimensionType> = DatasetPointSeriesValueItem<T>[];

export type DatasetPointSeriesProvider<T = SeriesDimensionType> = (
    request: DatasetPointSeriesRequest<T>
) => Promise<DatasetPointSeriesData<T>>;

export type DatasetPointSeriesConfig<T = SeriesDimensionType> = {
    provider: DatasetPointSeriesProvider<T>;
    variables: NumericVariable[];
    dimensions: (DatasetDimension<DataDomain<T>> & { preventSeries?: boolean })[];
};

export type DatasetPointSeriesProps = {
    seriesDimension?: string;
    seriesVariable?: string;
    seriesRange?: DomainRange<SeriesDimensionType>;
    autoUpdate?: boolean;
} & DatasetProcessingProps<typeof POINT_SERIES_PROCESSING, DatasetPointSeriesConfig> &
    DatasetDimensionsProps;

export class DatasetPointSeries extends DatasetProcessing<undefined> implements HasDatasetDimensions {
    readonly config: DatasetPointSeriesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref seriesDimension: string | undefined;
    @observable.ref seriesVariable: string | undefined;
    @observable.ref seriesRange: DomainRange<SeriesDimensionType> | undefined;
    @observable.ref data: DatasetPointSeriesData<SeriesDimensionType>;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetPointSeriesData | undefined, DatasetPointSeriesRequest<SeriesDimensionType>>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetPointSeriesProps, 'vizType'>) {
        super({
            vizType: POINT_SERIES_PROCESSING,
            ...props
        });

        this.config = props.config;

        const parentDimensions = (props.parent as HasDatasetDimensions | undefined)?.dimensions;

        this.seriesDimension = props.seriesDimension;
        this.seriesVariable = props.seriesVariable;
        if (!this.seriesVariable) {
            if (parentDimensions?.variable && this.config.variables.find((variable) => variable.id === parentDimensions.variable)) {
                this.seriesVariable = parentDimensions.variable;
            }
        }
        this.seriesRange = props.seriesRange;
        this.data = [];
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        makeObservable(this);

        this.dimensions = new DatasetDimensions({
            dimensionValues: props.dimensionValues || parentDimensions?.values,
            dataset: props.dataset,
            currentVariable: () => this.seriesVariable,
            dimensions: props.config.dimensions,
            initDimensions: true
        });

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            },
            debounceInterval: this.autoUpdate ? 1000 : 0
        });
        this.needsUpdate_ = true;
        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    @action
    setDimension(dimension: string | undefined, range?: DomainRange<SeriesDimensionType>) {
        this.needsUpdate_ = true;
        this.seriesDimension = dimension;
        if (dimension) {
            this.dimensions.unsetValue(dimension);

            const domainPromise = this.dimensions.domainRequests.get(dimension);
            if (domainPromise) {
                domainPromise
                    .then((domain) => {
                        if (domain && isValueDomain(domain) && domain.min !== undefined && domain.max !== undefined) {
                            // if no range is defined or the current range is outside of the domain extent set the range to the domain extent
                            if (!range || range.min >= domain.max || range.max <= domain.min) {
                                this.setRange({
                                    min: domain.min,
                                    max: domain.max
                                });
                            } else {
                                // clamp the range to the domain extent
                                let min = range.min;
                                let max = range.max;
                                if (min < domain.min) {
                                    min = domain.min;
                                }
                                if (max > domain.max) {
                                    max = domain.max;
                                }
                                this.setRange({
                                    min: min,
                                    max: max
                                });
                            }
                        } else {
                            this.setRange(range);
                        }
                    })
                    .catch(() => {
                        this.setRange(range);
                    });
            } else {
                this.setRange(range);
            }
        } else {
            this.seriesRange = undefined;
        }
    }

    @action
    setVariable(variable: string | undefined) {
        this.needsUpdate_ = true;
        this.seriesVariable = variable;
    }

    @action
    setRange(range: DomainRange<SeriesDimensionType> | undefined) {
        this.needsUpdate_ = true;
        this.seriesRange = range;
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
        return (
            !!this.seriesDimension &&
            this.geometry &&
            this.geometry.type === 'Point' &&
            !!this.seriesVariable &&
            this.config.dimensions.every((dim) => {
                return dim.id === this.seriesDimension || this.dimensions.values.has(dim.id);
            })
        );
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.dataFetcher_
                    .fetchData({
                        dimension: this.seriesDimension!,
                        location: this.geometry! as GeoJSON.Point,
                        variable: this.seriesVariable!,
                        range: this.seriesRange,
                        dimensionValues: new Map(this.dimensions.values)
                    })
                    .then((data) => {
                        this.needsUpdate_ = false;
                        this.setData_(data || []);
                    })
                    .catch(() => {
                        this.setData_([]);
                    });
            }
        } else {
            this.loadingState.setValue(LoadingState.Init);
            this.setData_([]);
        }
    }

    clone() {
        return this.clone_({
            config: this.config,
            seriesDimension: this.seriesDimension,
            seriesVariable: this.seriesVariable,
            seriesRange: this.seriesRange,
            dimensionValues: this.dimensions.values,
            autoUpdate: this.autoUpdate
        }) as DatasetPointSeries;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
        this.dimensions.dispose();
    }

    @action
    protected setData_(data: DatasetPointSeriesData<SeriesDimensionType>) {
        this.data = data;
    }

    protected afterInit_() {
        if (!this.seriesVariable) {
            this.setVariable(this.config.variables[0].id);
        }
        if (!this.seriesDimension) {
            const firstDimension = this.config.dimensions.find((dimension) => !dimension.preventSeries);
            this.setDimension(firstDimension?.id);
        }

        const seriesUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                this.retrieveData();
            }
        });

        const updateTrackerDisposer = reaction(
            () => {
                return {
                    aoi: this.geometry,
                    dimensions: new Map(this.dimensions.values)
                };
            },
            () => {
                this.needsUpdate_ = true;
            }
        );

        this.subscriptionTracker_.addSubscription(seriesUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}

export class DatasetPointSeriesAnalysis extends DatasetAnalysis<DatasetPointSeries> {
    constructor(props: Omit<DatasetAnalysisProps<DatasetPointSeries>, 'type'>) {
        super({
            type: POINT_SERIES_PROCESSING,
            ...props
        });
    }
}
