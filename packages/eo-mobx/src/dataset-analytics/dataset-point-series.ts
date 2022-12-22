import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import { LoadingState, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';

import { DatasetDimension, NumericVariable, DimensionDomainType, DimensionRangeType, CategoricalDimensionValueType } from '../common';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';

export const POINT_SERIES_PROCESSING = 'point_series_processing';

type SeriesDimensionType = string | Date | number;

export type DatasetPointSeriesRequest = {
    dimension: string;
    range?: DimensionRangeType;
    dimensionValues?: Map<string, CategoricalDimensionValueType>;
    variable: string;
    location: GeoJSON.Point;
};

export type DatasetPointSeriesValueItem<T = SeriesDimensionType> = {
    x: T;
    y: number;
};

export type DatasetPointSeriesData<T = SeriesDimensionType> = DatasetPointSeriesValueItem<T>[];

export type DatasetPointSeriesProvider<T = SeriesDimensionType> = (
    request: DatasetPointSeriesRequest
) => Promise<DatasetPointSeriesData<T>>;

export type DatasetPointSeriesConfig<T = SeriesDimensionType> = {
    provider: DatasetPointSeriesProvider<T>;
    variables: NumericVariable[];
    dimensions: (DatasetDimension<DimensionDomainType> & { preventSeries?: boolean })[];
};

export type DatasetPointSeriesProps = Omit<
    DatasetProcessingProps<typeof POINT_SERIES_PROCESSING, DatasetPointSeriesConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> & {
    seriesDimension?: string;
    seriesVariable?: string;
    autoUpdate?: boolean;
};

export class DatasetPointSeries extends DatasetProcessing<typeof POINT_SERIES_PROCESSING, undefined> {
    readonly config: DatasetPointSeriesConfig;
    @observable.ref seriesDimension: string | undefined;
    @observable.ref seriesVariable: string | undefined;
    @observable.ref data: DatasetPointSeriesData<SeriesDimensionType>;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetPointSeriesData | undefined, DatasetPointSeriesRequest>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetPointSeriesProps, 'vizType'>) {
        super({
            vizType: POINT_SERIES_PROCESSING,
            dimensionValues: props.dimensionValues || props.parent?.dimensions.values,
            currentVariable: () => this.seriesVariable,
            dimensions: props.config.dimensions,
            initDimensions: true,
            ...props
        });

        this.config = props.config;

        this.seriesDimension = props.seriesDimension;
        this.seriesVariable = props.seriesVariable;

        this.data = [];
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        if (!this.seriesVariable) {
            const parentVariable = this.parent?.dimensions.variable;
            if (parentVariable && this.config.variables.find((variable) => variable.id === parentVariable)) {
                this.seriesVariable = parentVariable;
            }
        }

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

    @computed
    get seriesRange() {
        if (this.seriesDimension) {
            return this.dimensions.ranges.get(this.seriesDimension);
        } else {
            return undefined;
        }
    }

    @action
    setDimension(dimension: string | undefined, range?: DimensionRangeType) {
        this.needsUpdate_ = true;
        if (this.seriesDimension) {
            this.dimensions.unsetRange(this.seriesDimension);
        }
        this.seriesDimension = dimension;
        if (dimension) {
            this.dimensions.setRange(dimension, range);
        }
    }

    @action
    setVariable(variable: string | undefined) {
        this.needsUpdate_ = true;
        this.seriesVariable = variable;
    }

    @action
    setRange(range: DimensionRangeType | undefined) {
        if (this.seriesDimension) {
            this.needsUpdate_ = true;
            this.dimensions.setRange(this.seriesDimension, range);
        }
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
            autoUpdate: this.autoUpdate
        });
    }

    getSnapshot() {
        return {
            ...super.getSnapshot(),
            seriesDimension: this.seriesDimension,
            seriesVariable: this.seriesVariable
        };
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

export class DatasetPointSeriesAnalysis extends DatasetAnalysis<typeof POINT_SERIES_PROCESSING, DatasetPointSeries> {
    constructor(props: Omit<DatasetAnalysisProps<typeof POINT_SERIES_PROCESSING, DatasetPointSeries>, 'type'>) {
        super({
            type: POINT_SERIES_PROCESSING,
            ...props
        });
    }
}
