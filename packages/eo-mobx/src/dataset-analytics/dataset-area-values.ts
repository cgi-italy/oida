import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import { AoiSupportedGeometry, BBoxGeometry, CircleGeometry, LoadingState, QueryFilter, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';

import {
    DatasetVariable, DatasetDimension, DataDomain, TimeSearchDirection, NumericDomain, CategoricalDomain,
    DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps, ColorMapProps, DistributionHistogramBin, DistributionPercentile
} from '../common';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';

export const DATASET_AREA_VALUES_PROCESSING = 'dataset_area_values_processing';

type DatasetAreaValuesDimensionType = string | Date | number;
type DatasetAreaValuesImageType = HTMLImageElement | HTMLCanvasElement | string;

export type DatasetAreaValuesDataMask = {
    stats: boolean;
    gridValues: boolean;
    image: boolean;
};

export type DatasetAreaValuesRequest = {
    variable: string;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry;
    dataMask: Partial<DatasetAreaValuesDataMask>;
    gridSize?: number[];
    dimensionValues?: Map<string, DatasetAreaValuesDimensionType>;
    colorMap?: ColorMapProps;
    additionalDatasetFilters?: Map<string, QueryFilter>;
};

export type DatasetAreaStatistics = {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    variance?: number;
    histogram?: DistributionHistogramBin[];
    percentiles?: DistributionPercentile[];
};

export type DatasetAreaValuesData = {
    stats?: DatasetAreaStatistics;
    gridValues?: number[];
    image?: DatasetAreaValuesImageType;
};

export type DatasetAreaValuesProvider = (request: DatasetAreaValuesRequest) => Promise<DatasetAreaValuesData>;

export type DatasetAreaValuesConfig = {
    variables: DatasetVariable<NumericDomain | CategoricalDomain<number>>[];
    supportedGeometries: AoiSupportedGeometry[];
    supportedData: DatasetAreaValuesDataMask;
    provider: DatasetAreaValuesProvider;
    dimensions: DatasetDimension<DataDomain<DatasetAreaValuesDimensionType>>[];
};


export type DatasetAreaValuesProps = {
    variable?: string;
    autoUpdate?: boolean;
    dataMask?: Partial<DatasetAreaValuesDataMask>;
} & DatasetProcessingProps<typeof DATASET_AREA_VALUES_PROCESSING, DatasetAreaValuesConfig> & DatasetDimensionsProps;

export class DatasetAreaValues extends DatasetProcessing<undefined> implements HasDatasetDimensions {

    readonly config: DatasetAreaValuesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref variable: string | undefined;
    @observable.ref data: DatasetAreaValuesData | undefined;
    @observable.ref autoUpdate: boolean;
    @observable.ref dataMask: Partial<DatasetAreaValuesDataMask>;

    protected dataFetcher_: AsyncDataFetcher<DatasetAreaValuesData | undefined, DatasetAreaValuesRequest>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetAreaValuesProps, 'vizType'>) {
        super({
            vizType: DATASET_AREA_VALUES_PROCESSING,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.variable = props.variable;
        this.data = undefined;
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;
        this.dataMask = props.dataMask || {
            stats: true
        };

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

    @action
    setDataMask(dataMask: Partial<DatasetAreaValuesDataMask>) {
        this.needsUpdate_ = true;
        this.dataMask = dataMask;
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
            if (this.needsUpdate_) {
                this.dataFetcher_.fetchData({
                    geometry: this.aoi!.geometry.value as (GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry),
                    variable: this.variable!,
                    additionalDatasetFilters: new Map(this.dataset.additionalFilters.items),
                    dimensionValues: new Map(this.dimensions.values),
                    dataMask: this.dataMask
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
        }) as DatasetAreaValues;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
        this.dimensions.dispose();
    }

    @action
    protected setData_(data: DatasetAreaValuesData | undefined) {
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
                const datasetTime = this.dataset.toi;
                if (datasetTime) {
                    if (datasetTime instanceof Date) {
                        this.dimensions.setValue('time', datasetTime);
                    } else {
                        //a time range is currently selected. try to find the time nearest to the range end time
                        const timeProvider = this.dataset.config.timeDistribution?.provider;
                        if (timeProvider) {
                            timeProvider.getNearestItem(
                                datasetTime.end,
                                TimeSearchDirection.Backward,
                                this.dimensions
                            ).then((dt) => {
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

        const updateTrackerDisposer = reaction(() => {
            return {
                aoi: this.geometry,
                dimensions: new Map(this.dimensions.values)
            };
        }, () => {
            this.needsUpdate_ = true;
        });

        this.subscriptionTracker_.addSubscription(statsUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}

