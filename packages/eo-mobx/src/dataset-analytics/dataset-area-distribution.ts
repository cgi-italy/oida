import { AoiSupportedGeometry, BBoxGeometry, CircleGeometry, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';
import { action, autorun, computed, makeObservable, observable } from 'mobx';
import {
    EnumFeaturePropertyDescriptor,
    ENUM_FEATURE_PROPERTY_TYPE,
    NumericFeaturePropertyDescriptor,
    NUMERIC_FEATURE_PROPERTY_TYPE
} from '../dataset-map-viz';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';

export const DATASET_AREA_DISTRIBUTION_PROCESSING = 'dataset_area_distribution_processing';

export type DatasetAreaDistributionMeasureType = 'count' | 'length' | 'area';
export type DatasetAreaDistributionAggregationMethod = 'sum' | 'avg' | 'min' | 'max';

export enum DatasetAreaDistributionMode {
    EnumCount = 'ENUM_COUNT',
    NumericGroupByEnum = 'NUMERIC_GROUP_BY_ENUM',
    EnumGroupByEnum = 'ENUM_GROUP_BY_ENUM',
    NumericStats = 'NUMERIC_STATS'
}

type DatasetAreaDistributionRequestBase = {
    variable: string;
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry;
};

export type DatasetAreaDistributionEnumCountRequest = DatasetAreaDistributionRequestBase & {
    mode: DatasetAreaDistributionMode.EnumCount;
    measureType?: DatasetAreaDistributionMeasureType;
};

export type DatasetAreaDistributioNumericGroupByEnumRequest = DatasetAreaDistributionRequestBase & {
    mode: DatasetAreaDistributionMode.NumericGroupByEnum;
    groupBy: {
        variable: string;
        method?: DatasetAreaDistributionAggregationMethod;
    };
};

export type DatasetAreaDistributioEnumGroupByEnumRequest = DatasetAreaDistributionRequestBase & {
    mode: DatasetAreaDistributionMode.EnumGroupByEnum;
    groupBy: {
        variable: string;
    };
};

export type DatasetAreaDistributionNumericStatsRequest = DatasetAreaDistributionRequestBase & {
    mode: DatasetAreaDistributionMode.NumericStats;
};

export type DatasetAreaDistributionRequest =
    | DatasetAreaDistributionEnumCountRequest
    | DatasetAreaDistributioNumericGroupByEnumRequest
    | DatasetAreaDistributioEnumGroupByEnumRequest
    | DatasetAreaDistributionNumericStatsRequest;

export type DatasetAreaDistributionEnumCountResponse = {
    mode: DatasetAreaDistributionMode.EnumCount;
    totals: Record<string, number>;
    /**
     * The measure type of the per class totals.
     * When set to 'length' the totals are assumed to be in meters.
     * When set to 'area' the totals are assumed to be in squared meters.
     * If omitted 'count' is assumed
     **/
    measureType?: DatasetAreaDistributionMeasureType;
};

export type DatasetAreaDistributionNumericGroupByEnumResponse = {
    mode: DatasetAreaDistributionMode.NumericGroupByEnum;
    totals: Record<string, number>;
    aggregationMethod: DatasetAreaDistributionAggregationMethod;
};

export type DatasetAreaDistributionEnumGroupByEnumResponse = {
    mode: DatasetAreaDistributionMode.EnumGroupByEnum;
    totals: Record<string, Record<string, number>>;
    measureType?: DatasetAreaDistributionMeasureType;
};

export type DatasetAreaDistributionData =
    | DatasetAreaDistributionEnumCountResponse
    | DatasetAreaDistributionNumericGroupByEnumResponse
    | DatasetAreaDistributionEnumGroupByEnumResponse;

export type DatasetAreaDistributionProvider = (request: DatasetAreaDistributionRequest) => Promise<DatasetAreaDistributionData>;

export type DatasetAreaDistributionConfig = {
    variables: (EnumFeaturePropertyDescriptor | NumericFeaturePropertyDescriptor)[];
    supportedGeometries: AoiSupportedGeometry[];
    supportedModes: DatasetAreaDistributionMode[];
    supportedMeasureTypes: DatasetAreaDistributionMeasureType[];
    supportedAggregationMethods: DatasetAreaDistributionAggregationMethod[];
    provider: DatasetAreaDistributionProvider;
    aoiRequired?: boolean;
};

export type DatasetAreaDistributionProps = Omit<
    DatasetProcessingProps<typeof DATASET_AREA_DISTRIBUTION_PROCESSING, DatasetAreaDistributionConfig>,
    'dimensions' | 'currentVariable'
> & {
    variable?: string;
    groupByVariable?: string;
    autoUpdate?: boolean;
    aggregationMethod?: DatasetAreaDistributionAggregationMethod;
    measureType?: DatasetAreaDistributionMeasureType;
};

export class DatasetAreaDistribution extends DatasetProcessing<typeof DATASET_AREA_DISTRIBUTION_PROCESSING, undefined> {
    readonly config: DatasetAreaDistributionConfig;
    @observable.ref variable: string | undefined;
    @observable.ref groupByVariable: string | undefined;
    @observable.ref aggregationMethod: DatasetAreaDistributionAggregationMethod;
    @observable.ref measureType: DatasetAreaDistributionMeasureType;
    @observable.ref data: DatasetAreaDistributionData | undefined;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetAreaDistributionData | undefined, DatasetAreaDistributionRequest>;
    protected subscriptionTracker_: SubscriptionTracker;

    protected availableModes_ = {
        [DatasetAreaDistributionMode.EnumCount]: false,
        [DatasetAreaDistributionMode.NumericGroupByEnum]: false,
        [DatasetAreaDistributionMode.EnumGroupByEnum]: false,
        [DatasetAreaDistributionMode.NumericStats]: false
    };

    constructor(props: Omit<DatasetAreaDistributionProps, 'vizType'>) {
        super({
            vizType: DATASET_AREA_DISTRIBUTION_PROCESSING,
            currentVariable: () => this.variable,
            ...props
        });

        this.config = props.config;
        this.variable = props.variable;
        this.groupByVariable = props.groupByVariable;
        this.aggregationMethod = props.aggregationMethod || this.config.supportedAggregationMethods[0];
        this.measureType = props.measureType || this.config.supportedMeasureTypes[0];

        this.data = undefined;
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            },
            debounceInterval: this.autoUpdate ? 1000 : 0
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    @action
    setVariable(variable: string | undefined) {
        this.variable = variable;
        this.setGroupByVariable(this.groupByVariable);
    }

    @action
    setGroupByVariable(variable: string | undefined) {
        if (!this.variable) {
            this.groupByVariable = undefined;
        } else {
            if (variable === this.variable) {
                this.groupByVariable = undefined;
            } else {
                const groupByVariableDescriptor = this.config.variables.find((v) => v.id === variable);
                if (!groupByVariableDescriptor || groupByVariableDescriptor.type !== ENUM_FEATURE_PROPERTY_TYPE) {
                    this.groupByVariable = undefined;
                } else {
                    this.groupByVariable = variable;
                }
            }
        }
    }

    @action
    setAggregatioNMethod(method: DatasetAreaDistributionAggregationMethod) {
        if (this.config.supportedAggregationMethods.some((supportedMethod) => supportedMethod === method)) {
            this.aggregationMethod = method;
        }
    }

    @action
    setMeasureType(type: DatasetAreaDistributionMeasureType) {
        if (this.config.supportedMeasureTypes.some((supportedType) => supportedType === type)) {
            this.measureType = type;
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

    getAvailableModes() {
        return this.availableModes_;
    }

    @computed
    get currentMode() {
        if (!this.variable) {
            return undefined;
        }
        const variableConfig = this.config.variables.find((v) => v.id === this.variable);
        if (!variableConfig) {
            return undefined;
        }
        if (variableConfig.type === ENUM_FEATURE_PROPERTY_TYPE) {
            if (this.groupByVariable) {
                return DatasetAreaDistributionMode.EnumGroupByEnum;
            } else {
                return DatasetAreaDistributionMode.EnumCount;
            }
        } else if (variableConfig.type === NUMERIC_FEATURE_PROPERTY_TYPE) {
            if (this.groupByVariable) {
                return DatasetAreaDistributionMode.NumericGroupByEnum;
            } else {
                return DatasetAreaDistributionMode.NumericStats;
            }
        }
    }

    @computed
    get variableDescriptor() {
        if (!this.variable) {
            return undefined;
        }
        return this.config.variables.find((variable) => variable.id === this.variable);
    }

    @computed
    get groupByVariableDescriptor() {
        if (!this.groupByVariable) {
            return undefined;
        }
        return this.config.variables.find((variable) => variable.id === this.groupByVariable) as EnumFeaturePropertyDescriptor | undefined;
    }

    clone(): this {
        return this.clone_({
            config: this.config,
            variable: this.variable,
            groupByVariable: this.groupByVariable,
            aggregationMethod: this.aggregationMethod,
            measureType: this.measureType,
            autoUpdate: this.autoUpdate
        });
    }

    getSnapshot() {
        return {
            ...super.getSnapshot(),
            variable: this.variable,
            groupByVariable: this.groupByVariable,
            aggregationMethod: this.aggregationMethod,
            measureType: this.measureType
        };
    }

    dispose(): void {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    retrieveData() {
        if (this.canRunQuery) {
            const requestBase = {
                variable: this.variable!,
                geometry: this.aoi?.geometry.value as GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry
            };

            let request: DatasetAreaDistributionRequest;

            if (this.variableDescriptor?.type === ENUM_FEATURE_PROPERTY_TYPE) {
                if (this.groupByVariable) {
                    request = {
                        ...requestBase,
                        mode: DatasetAreaDistributionMode.EnumGroupByEnum,
                        groupBy: {
                            variable: this.groupByVariable
                        }
                    };
                } else {
                    request = {
                        ...requestBase,
                        measureType: this.measureType,
                        mode: DatasetAreaDistributionMode.EnumCount
                    };
                }
            } else {
                if (this.groupByVariable) {
                    request = {
                        ...requestBase,
                        mode: DatasetAreaDistributionMode.NumericGroupByEnum,
                        groupBy: {
                            variable: this.groupByVariable,
                            method: this.aggregationMethod
                        }
                    };
                } else {
                    request = {
                        ...requestBase,
                        mode: DatasetAreaDistributionMode.NumericStats
                    };
                }
            }
            this.dataFetcher_
                .fetchData(request)
                .then((data) => {
                    this.setData(data);
                })
                .catch(() => {
                    this.setData(undefined);
                });
        }
    }

    @computed
    get canRunQuery(): boolean {
        const variableDescriptor = this.variableDescriptor;
        let hasRequiredParams = !!variableDescriptor;
        if (this.config.aoiRequired && !!this.aoi?.geometry.value) {
            hasRequiredParams = false;
        }
        if (hasRequiredParams) {
            if (!this.groupByVariable) {
                if (variableDescriptor!.type === NUMERIC_FEATURE_PROPERTY_TYPE && !this.availableModes_.NUMERIC_STATS) {
                    hasRequiredParams = false;
                } else if (variableDescriptor!.type === ENUM_FEATURE_PROPERTY_TYPE && !this.availableModes_.ENUM_COUNT) {
                    hasRequiredParams = false;
                }
            } else {
                if (variableDescriptor!.type === NUMERIC_FEATURE_PROPERTY_TYPE && !this.availableModes_.NUMERIC_GROUP_BY_ENUM) {
                    hasRequiredParams = false;
                } else if (variableDescriptor!.type === ENUM_FEATURE_PROPERTY_TYPE && !this.availableModes_.ENUM_GROUP_BY_ENUM) {
                    hasRequiredParams = false;
                }
            }
        }
        return hasRequiredParams;
    }

    @action
    protected setData(data: DatasetAreaDistributionData | undefined) {
        this.data = data;
    }

    protected afterInit_() {
        this.computeAvailableModes_();

        if (!this.variable) {
            this.variable = this.config.variables[0].id;
        }

        const statsUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                this.retrieveData();
            }
        });

        this.subscriptionTracker_.addSubscription(statsUpdaterDisposer);
    }

    protected computeAvailableModes_() {
        let totalNumericProperties = 0;
        let totalEnumProperties = 0;

        this.config.variables.forEach((variable) => {
            if (variable.type === NUMERIC_FEATURE_PROPERTY_TYPE) {
                totalNumericProperties++;
            } else if (variable.type === ENUM_FEATURE_PROPERTY_TYPE) {
                totalEnumProperties++;
            }
        });

        this.config.supportedModes.forEach((mode) => {
            if (mode === DatasetAreaDistributionMode.EnumCount && totalEnumProperties > 0) {
                this.availableModes_[mode] = true;
            } else if (mode === DatasetAreaDistributionMode.NumericGroupByEnum && totalNumericProperties > 0 && totalEnumProperties > 0) {
                this.availableModes_[mode] = true;
            } else if (mode === DatasetAreaDistributionMode.EnumGroupByEnum && totalEnumProperties > 1) {
                this.availableModes_[mode] = true;
            } else if (mode === DatasetAreaDistributionMode.NumericStats && totalNumericProperties > 0) {
                this.availableModes_[mode] = true;
            }
        });
    }

    protected initMapLayer_(): undefined {
        return undefined;
    }
}

export class DatasetAreaDistributionAnalysis extends DatasetAnalysis<typeof DATASET_AREA_DISTRIBUTION_PROCESSING, DatasetAreaDistribution> {
    constructor(props: Omit<DatasetAnalysisProps<typeof DATASET_AREA_DISTRIBUTION_PROCESSING, DatasetAreaDistribution>, 'type'>) {
        super({
            type: DATASET_AREA_DISTRIBUTION_PROCESSING,
            ...props
        });
    }
}
