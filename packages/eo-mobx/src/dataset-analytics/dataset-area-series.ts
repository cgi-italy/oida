import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import {
    AoiSupportedGeometry,
    LoadingState,
    SubscriptionTracker,
    IFormFieldDefinition,
    QueryFilter,
    CircleGeometry,
    BBoxGeometry
} from '@oidajs/core';
import { AsyncDataFetcher, DataFilters } from '@oidajs/state-mobx';

import {
    DatasetDimension,
    DataDomain,
    DomainRange,
    isValueDomain,
    DatasetDimensions,
    HasDatasetDimensions,
    DatasetDimensionsProps,
    ColorMap
} from '../common';
import { getDatasetVariableDomain, getRasterBandSingleConfig } from '../utils';
import { RasterBandConfig, RasterBandModeType, RasterMapViz } from '../dataset-map-viz';
import { DatasetAreaValuesData, DatasetAreaValuesDataMask, DatasetAreaValuesRequest } from './dataset-area-values';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';

export const DATASET_AREA_SERIES_PROCESSING = 'dataset_area_series_processing';

type SequenceDimensionType = string | Date | number;

export type DatasetAreaSeriesRequest = DatasetAreaValuesRequest & {
    dimension: string;
    range?: DomainRange<SequenceDimensionType>;
    additionalParameters?: QueryFilter[];
};

export type DatasetAreaSeriesDataItem = {
    x: SequenceDimensionType;
    data: DatasetAreaValuesData;
};

export type DatasetAreaSeriesProvider = (request: DatasetAreaSeriesRequest) => Promise<DatasetAreaSeriesDataItem[]>;

export type DatasetAreaSeriesConfig = {
    provider: DatasetAreaSeriesProvider;
    variables: RasterBandConfig[];
    supportedGeometries: AoiSupportedGeometry[];
    supportedData: DatasetAreaValuesDataMask;
    dimensions: (DatasetDimension<DataDomain<SequenceDimensionType>> & { preventSeries?: boolean })[];
    additionalParameters?: IFormFieldDefinition[];
};

export type DatasetAreaSeriesProps = {
    sequenceDimension?: string;
    sequenceVariable?: string;
    sequenceRange?: DomainRange<SequenceDimensionType>;
    autoUpdate?: boolean;
    additionalParameters?: Record<string, any>;
    dataMask?: Partial<DatasetAreaValuesDataMask>;
} & DatasetProcessingProps<typeof DATASET_AREA_SERIES_PROCESSING, DatasetAreaSeriesConfig> &
    DatasetDimensionsProps;

export class DatasetAreaSeries extends DatasetProcessing<undefined> implements HasDatasetDimensions {
    readonly config: DatasetAreaSeriesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref sequenceDimension: string | undefined;
    @observable.ref sequenceVariable: string | undefined;
    @observable.ref sequenceRange: DomainRange<SequenceDimensionType> | undefined;
    @observable.ref colorMap: ColorMap | undefined;
    @observable.ref data: DatasetAreaSeriesDataItem[];
    @observable.ref autoUpdate: boolean;
    @observable.ref dataMask: Partial<DatasetAreaValuesDataMask>;
    readonly additionalParameters: DataFilters;

    protected dataFetcher_: AsyncDataFetcher<DatasetAreaSeriesDataItem[] | undefined, DatasetAreaSeriesRequest>;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetAreaSeriesProps, 'vizType'>) {
        super({
            vizType: DATASET_AREA_SERIES_PROCESSING,
            ...props
        });

        const parentDimensions = (props.parent as HasDatasetDimensions | undefined)?.dimensions;

        this.config = props.config;

        this.sequenceDimension = props.sequenceDimension;
        this.sequenceVariable = undefined;
        this.sequenceRange = props.sequenceRange;
        this.data = [];
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;
        this.colorMap = undefined;

        this.dimensions = new DatasetDimensions({
            dimensionValues: props.dimensionValues || parentDimensions?.values,
            dataset: props.dataset,
            currentVariable: () => this.sequenceVariable,
            dimensions: props.config.dimensions,
            initDimensions: true
        });

        let sequenceVariable = props.sequenceVariable;
        if (!sequenceVariable) {
            if (parentDimensions?.variable && this.config.variables.find((variable) => variable.id === parentDimensions.variable)) {
                sequenceVariable = parentDimensions.variable;
            }
        }
        this.setVariable(sequenceVariable);

        this.additionalParameters = new DataFilters({
            values: props.additionalParameters
        });
        this.dataMask = props.dataMask || {
            stats: true,
            image: true
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
    setDimension(dimension: string | undefined, range?: DomainRange<SequenceDimensionType>) {
        if (dimension === this.sequenceDimension) {
            if (range) {
                this.setRange(range);
            }
            return;
        }

        this.needsUpdate_ = true;
        this.sequenceDimension = dimension;
        if (dimension) {
            this.dimensions.unsetValue(dimension);

            const dimensionConfig = this.config.dimensions?.find((dim) => dim.id === dimension);

            if (dimensionConfig) {
                getDatasetVariableDomain(dimensionConfig)
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
            this.setRange(range);
        }
    }

    @action
    setVariable(variable: string | undefined) {
        this.needsUpdate_ = true;
        this.sequenceVariable = variable;
        this.colorMap = undefined;

        if (variable) {
            const variableConfig = this.config.variables.find((v) => v.id === variable);
            if (variableConfig?.colorScales) {
                if (this.parent instanceof RasterMapViz) {
                    const parentBandMode = this.parent.bandMode.value;
                    if (parentBandMode?.type === RasterBandModeType.Single && parentBandMode.band === variable) {
                        this.colorMap = new ColorMap(parentBandMode.colorMap.asProps());
                    }
                }

                if (!this.colorMap) {
                    getRasterBandSingleConfig({
                        bands: this.config.variables,
                        default: {
                            band: variable
                        }
                    }).then((colormapConfig) => {
                        this.colorMap = new ColorMap(colormapConfig.colorMap);
                    });
                }
            }
        }
    }

    @action
    setRange(range: DomainRange<SequenceDimensionType> | undefined) {
        // deep equality check
        if (range && this.sequenceRange && this.sequenceRange.min === range.min && this.sequenceRange.max === range.max) {
            return;
        }
        this.needsUpdate_ = true;
        this.sequenceRange = range;
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
            !!this.sequenceDimension &&
            !!this.geometry &&
            !!this.sequenceVariable &&
            this.config.dimensions.every((dim) => {
                return dim.id === this.sequenceDimension || this.dimensions.values.has(dim.id);
            }) &&
            (!this.config.additionalParameters ||
                this.config.additionalParameters.every((field) => {
                    return !field.required || this.additionalParameters.get(field.name);
                }))
        );
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.setData_([]);
                return this.dataFetcher_
                    .fetchData({
                        dimension: this.sequenceDimension!,
                        geometry: this.geometry! as GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry,
                        variable: this.sequenceVariable!,
                        range: this.sequenceRange,
                        dimensionValues: new Map(this.dimensions.values),
                        additionalParameters: this.additionalParameters.asArray(),
                        colorMap: this.colorMap?.asProps(),
                        dataMask: this.dataMask
                    })
                    .then((data) => {
                        this.setData_(data || []);
                        this.needsUpdate_ = false;
                    })
                    .catch(() => {
                        this.setData_([]);
                    });
            } else {
                return Promise.resolve();
            }
        } else {
            this.loadingState.setValue(LoadingState.Init);
            this.setData_([]);
            return Promise.resolve();
        }
    }

    clone() {
        return this.clone_({
            config: this.config,
            sequenceDimension: this.sequenceDimension,
            sequenceVariable: this.sequenceVariable,
            sequenceRange: this.sequenceRange,
            dimensionValues: this.dimensions.values,
            autoUpdate: this.autoUpdate
        }) as DatasetAreaSeries;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
        this.dimensions.dispose();
    }

    @action
    protected setData_(data: DatasetAreaSeriesDataItem[]) {
        this.data = data;
    }

    protected afterInit_() {
        if (!this.sequenceVariable) {
            this.setVariable(this.config.variables[0].id);
        }
        if (!this.sequenceDimension) {
            this.setDimension(this.config.dimensions[0].id);
        }

        const sequenceUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                this.retrieveData();
            }
        });

        const updateTrackerDisposer = reaction(
            () => {
                return {
                    aoi: this.geometry,
                    dimensions: new Map(this.dimensions.values),
                    colorMap: this.colorMap?.asProps(),
                    additionalParameters: this.additionalParameters.asArray()
                };
            },
            () => {
                this.needsUpdate_ = true;
            }
        );

        this.subscriptionTracker_.addSubscription(sequenceUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}
