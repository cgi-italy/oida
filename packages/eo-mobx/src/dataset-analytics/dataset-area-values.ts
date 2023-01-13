import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import { AoiSupportedGeometry, BBoxGeometry, CircleGeometry, LoadingState, QueryFilter, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';

import {
    DatasetVariable,
    DatasetDimension,
    NumericDomain,
    CategoricalDomain,
    ColorMapProps,
    DistributionHistogramBin,
    DistributionPercentile,
    CategoricalDimensionValueType,
    DimensionDomainType
} from '../common';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';

export const DATASET_AREA_VALUES_PROCESSING = 'dataset_area_values_processing';

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
    dimensionValues?: Map<string, CategoricalDimensionValueType>;
    colorMap?: ColorMapProps;
    additionalDatasetFilters?: Map<string, QueryFilter>;
};

export type DatasetAreaStatistics = {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    variance?: number;
    sum?: number;
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
    dimensions: DatasetDimension<DimensionDomainType>[];
};

export type DatasetAreaValuesProps = Omit<
    DatasetProcessingProps<typeof DATASET_AREA_VALUES_PROCESSING, DatasetAreaValuesConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> & {
    variable?: string;
    autoUpdate?: boolean;
    dataMask?: Partial<DatasetAreaValuesDataMask>;
};

export class DatasetAreaValues extends DatasetProcessing<typeof DATASET_AREA_VALUES_PROCESSING, undefined> {
    readonly config: DatasetAreaValuesConfig;
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
            dimensionValues: props.dimensionValues || props.parent?.dimensions.values,
            currentVariable: () => this.variable,
            dimensions: props.config.dimensions,
            initDimensions: true,
            ...props
        });

        this.config = props.config;

        this.variable = props.variable;
        if (!this.variable) {
            const parentVariable = this.parent?.dimensions.variable;
            if (parentVariable && this.config.variables.find((variable) => variable.id === parentVariable)) {
                this.variable = parentVariable;
            }
        }
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
        return (
            !!this.aoi?.geometry.value &&
            !!this.variable &&
            this.config.dimensions.every((dim) => {
                return this.dimensions.values.has(dim.id);
            })
        );
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.dataFetcher_
                    .fetchData({
                        geometry: this.aoi!.geometry.value as GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry,
                        variable: this.variable!,
                        additionalDatasetFilters: new Map(this.dataset.additionalFilters.items),
                        dimensionValues: new Map(this.dimensions.values),
                        dataMask: this.dataMask
                    })
                    .then((data) => {
                        this.needsUpdate_ = false;
                        this.setData_(data);
                    })
                    .catch(() => {
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
            autoUpdate: this.autoUpdate
        });
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    @action
    protected setData_(data: DatasetAreaValuesData | undefined) {
        this.data = data;
    }

    protected afterInit_() {
        if (!this.variable) {
            this.setVariable(this.config.variables[0].id);
        }

        const statsUpdaterDisposer = autorun(() => {
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

        this.subscriptionTracker_.addSubscription(statsUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}

export class DatasetAreaValuesAnalysis extends DatasetAnalysis<typeof DATASET_AREA_VALUES_PROCESSING, DatasetAreaValues> {
    constructor(props: Omit<DatasetAnalysisProps<typeof DATASET_AREA_VALUES_PROCESSING, DatasetAreaValues>, 'type'>) {
        super({
            type: DATASET_AREA_VALUES_PROCESSING,
            ...props
        });
    }
}
