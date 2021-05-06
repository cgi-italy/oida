import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import { Geometry, AoiSupportedGeometry, LoadingState, SubscriptionTracker } from '@oida/core';
import { AsyncDataFetcher } from '@oida/state-mobx';

import { DatasetDimension, DataDomain, DomainRange, isValueDomain, NumericVariable } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { getDatasetVariableDomain } from '../utils';


export const DIMENSION_SERIES_TYPE = 'dimension_series';

type SeriesDimensionType = string | Date | number;

export type DatasetDimensionSeriesRequest<T = SeriesDimensionType> = {
    dimension: string;
    range?: DomainRange<T>;
    dimensionValues?: Map<string, SeriesDimensionType>;
    variable: string;
    geometry: Geometry;
};

export type DatasetDimensionSeriesValueItem<T = SeriesDimensionType> = {
    x: T;
    y: number;
};

export type DatasetDimensionSeriesStatsItem<T = SeriesDimensionType> = {
    x: T;
    min: number;
    max: number;
    mean: number;
};

export type DatasetDimensionSeriesData<T = SeriesDimensionType> =
    DatasetDimensionSeriesValueItem<T>[] |  DatasetDimensionSeriesStatsItem<T>[];

export const isStatsDimensionSeriesData = <T = SeriesDimensionType>
(seriesData: DatasetDimensionSeriesData<T>) : seriesData is DatasetDimensionSeriesStatsItem<T>[] => {
    return !!seriesData.length && (seriesData as DatasetDimensionSeriesStatsItem<T>[])[0].min !== undefined;
};


export type DatasetDimensionSeriesProvider<T = SeriesDimensionType> =
    (request: DatasetDimensionSeriesRequest<T>) => Promise<DatasetDimensionSeriesData<T>>;

export type DatasetDimensionSeriesConfig<T = SeriesDimensionType> = {
    provider: DatasetDimensionSeriesProvider<T>;
    supportedGeometries: AoiSupportedGeometry[],
    variables: NumericVariable[];
    dimensions: DatasetDimension<DataDomain<T>>[];
};

export type DatasetDimensionSeriesProps = {
    seriesDimension?: string;
    seriesVariable?: string;
    seriesRange?: DomainRange<SeriesDimensionType>;
    autoUpdate?: boolean;
} & DatasetAnalysisProps<typeof DIMENSION_SERIES_TYPE, DatasetDimensionSeriesConfig> & DatasetDimensionsProps;

export class DatasetDimensionSeries extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly config: DatasetDimensionSeriesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref seriesDimension: string | undefined;
    @observable.ref seriesVariable: string | undefined;
    @observable.ref seriesRange: DomainRange<SeriesDimensionType> | undefined;
    @observable.ref data: DatasetDimensionSeriesData<SeriesDimensionType>;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetDimensionSeriesData | undefined, DatasetDimensionSeriesRequest<SeriesDimensionType>>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetDimensionSeriesProps, 'vizType'>) {
        super({
            vizType: DIMENSION_SERIES_TYPE,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.seriesDimension = props.seriesDimension;
        this.seriesVariable = props.seriesVariable;
        this.seriesRange = props.seriesRange;
        this.data = [];
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            },
            debounceInterval: this.autoUpdate ? 1000 : 0
        });
        this.needsUpdate_ = true;
        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    @action
    setDimension(dimension: string | undefined) {
        this.needsUpdate_ = true;
        this.seriesDimension = dimension;
        if (dimension) {
            this.dimensions.unsetValue(dimension);

            let dimensionConfig = this.config.dimensions?.find(dim => dim.id === dimension);

            if (dimensionConfig) {
                getDatasetVariableDomain(dimensionConfig).then((domain) => {
                    if (domain && isValueDomain(domain) && domain.min !== undefined && domain.max !== undefined) {
                        this.setRange({
                            min: domain.min,
                            max: domain.max
                        });
                    } else {
                        this.setRange(undefined);
                    }
                }).catch(() => {
                    this.setRange(undefined);
                });

            } else {
                this.setRange(undefined);
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
        return !!this.seriesDimension
            && this.geometry
            && !!this.seriesVariable
            && this.config.dimensions.every((dim) => {
                return (dim.id === this.seriesDimension) || this.dimensions.values.has(dim.id);
            });
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.dataFetcher_.fetchData({
                    dimension: this.seriesDimension!,
                    geometry: this.geometry!,
                    variable: this.seriesVariable!,
                    range: this.seriesRange,
                    dimensionValues: new Map(this.dimensions.values)
                }).then((data) => {
                    this.needsUpdate_ = false;
                    this.setData_(data || []);
                }).catch(() => {
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
        }) as DatasetDimensionSeries;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    @action
    protected setData_(data: DatasetDimensionSeriesData<SeriesDimensionType>) {
        this.data = data;
    }

    protected afterInit_() {

        if (!this.seriesVariable) {
            this.setVariable(this.config.variables[0].id);
        }
        if (!this.seriesDimension) {
            this.setDimension(this.config.dimensions[0].id);
        }

        const seriesUpdaterDisposer = autorun(() => {
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

        this.subscriptionTracker_.addSubscription(seriesUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}
