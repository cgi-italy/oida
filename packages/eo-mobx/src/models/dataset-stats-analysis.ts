import { autorun, observable, makeObservable, action, runInAction, computed } from 'mobx';

import { BBoxGeometry, LoadingState } from '@oida/core';
import { AsyncDataFetcher } from '@oida/state-mobx';

import { DatasetVariable, DatasetDimension, DataDomain, TimeSearchDirection, NumericDomain, CategoricalDomain } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';

export const STATS_ANALYSIS_TYPE = 'stats_analysis';

type StatsDimensionType = string | Date | number;

export type DatasetStatsRequest = {
    variable: string;
    geometry: GeoJSON.Polygon | BBoxGeometry;
    dimensionValues?: Map<string, StatsDimensionType>;
};

export type HistogramBin = [x_center: number, count: number, x_min: number, x_max: number];
export type DatasetStats = {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    variance?: number;
    histogram?: HistogramBin[]
};

export type DatasetStatsProvider = (request: DatasetStatsRequest) => Promise<DatasetStats>;

export type DatasetStatsAnalysisConfig = {
    variables: DatasetVariable<NumericDomain | CategoricalDomain<number>>[];
    provider: DatasetStatsProvider;
    dimensions: DatasetDimension<DataDomain<StatsDimensionType>>[];
};


export type DatasetStatsAnalysisProps = {
    variable?: string;
    autoUpdate?: boolean;
} & DatasetAnalysisProps<typeof STATS_ANALYSIS_TYPE, DatasetStatsAnalysisConfig> & DatasetDimensionsProps;

export class DatasetStatsAnalysis extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly config: DatasetStatsAnalysisConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref variable: string | undefined;
    @observable.ref data: DatasetStats | undefined;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetStats | undefined, DatasetStatsRequest>;

    constructor(props: Omit<DatasetStatsAnalysisProps, 'vizType'>) {
        super({
            vizType: STATS_ANALYSIS_TYPE,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.variable = props.variable;
        this.data = undefined;
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            },
            debounceInterval: this.autoUpdate ? 1000 : 0
        });

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }


    @action
    setVariable(variable: string | undefined) {
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
        && !!this.variable
        && this.config.dimensions.every((dim) => {
            return this.dimensions.values.has(dim.id);
        });
    }

    retrieveData() {
        if (this.canRunQuery) {
            this.dataFetcher_.fetchData({
                geometry: this.aoi!.geometry.value as (GeoJSON.Polygon | BBoxGeometry),
                variable: this.variable!,
                dimensionValues: new Map(this.dimensions.values)
            }).then((data) => {
                this.setData_(data);
            }).catch(() => {
                this.setData_(undefined);
            });
        } else {
            this.loadingState.setValue(LoadingState.Init);
            this.setData_(undefined);
        }
    }

    clone() {
        return this.clone_({
            config: this.config,
            variable: this.variable,
            dimensionValues: this.dimensions.values
        }) as DatasetStatsAnalysis;
    }

    @action
    setData_(data: DatasetStats | undefined) {
        this.data = data;
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
                const datasetTime = this.dataset.selectedTime;
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

        const statsUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                this.retrieveData();
            }
        });
    }

    protected initMapLayer_() {
        return undefined;
    }
}

