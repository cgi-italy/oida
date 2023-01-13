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

import { DatasetDimension, ColorMap, DimensionDomainType, DimensionRangeType } from '../common';
import { getRasterBandSingleConfig } from '../utils';
import { RasterBandConfig, RasterBandModeType, RasterMapViz } from '../dataset-map-viz';
import { DatasetAreaValuesData, DatasetAreaValuesDataMask, DatasetAreaValuesRequest } from './dataset-area-values';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';

export const DATASET_AREA_SERIES_PROCESSING = 'dataset_area_series_processing';

type SequenceDimensionType = string | Date | number;

export type DatasetAreaSeriesRequest = DatasetAreaValuesRequest & {
    dimension: string;
    range?: DimensionRangeType;
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
    dimensions: (DatasetDimension<DimensionDomainType> & { preventSeries?: boolean })[];
    additionalParameters?: IFormFieldDefinition[];
};

export type DatasetAreaSeriesProps = Omit<
    DatasetProcessingProps<typeof DATASET_AREA_SERIES_PROCESSING, DatasetAreaSeriesConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
> & {
    sequenceDimension?: string;
    sequenceVariable?: string;
    sequenceRange?: DimensionRangeType;
    autoUpdate?: boolean;
    additionalParameters?: Record<string, any>;
    dataMask?: Partial<DatasetAreaValuesDataMask>;
};

export class DatasetAreaSeries extends DatasetProcessing<typeof DATASET_AREA_SERIES_PROCESSING, undefined> {
    readonly config: DatasetAreaSeriesConfig;
    @observable.ref sequenceDimension: string | undefined;
    @observable.ref sequenceVariable: string | undefined;
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
            dimensionValues: props.dimensionValues || props.parent?.dimensions.values,
            currentVariable: () => this.sequenceVariable,
            dimensions: props.config.dimensions,
            initDimensions: true,
            ...props
        });

        this.config = props.config;

        this.sequenceDimension = undefined;
        this.sequenceVariable = undefined;
        this.data = [];
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;
        this.colorMap = undefined;

        let sequenceVariable = props.sequenceVariable;
        if (!sequenceVariable) {
            const parentVariable = this.parent?.dimensions.variable;
            if (parentVariable && this.config.variables.find((variable) => variable.id === parentVariable)) {
                sequenceVariable = parentVariable;
            }
        }
        this.setVariable(sequenceVariable);
        this.setDimension(props.sequenceDimension, props.sequenceRange);

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

    @computed
    get sequenceRange() {
        if (this.sequenceDimension) {
            return this.dimensions.ranges.get(this.sequenceDimension);
        } else {
            return undefined;
        }
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    @action
    setDimension(dimension: string | undefined, range?: DimensionRangeType) {
        this.needsUpdate_ = true;
        if (this.sequenceDimension) {
            this.dimensions.unsetRange(this.sequenceDimension);
        }
        this.sequenceDimension = dimension;
        if (dimension) {
            this.dimensions.setRange(dimension, range);
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
                        this.colorMap = new ColorMap(parentBandMode.colorMap.getSnapshot());
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
    setRange(range: DimensionRangeType | undefined) {
        if (this.sequenceDimension) {
            this.needsUpdate_ = true;
            this.dimensions.setRange(this.sequenceDimension, range);
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
                        colorMap: this.colorMap?.getSnapshot(),
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
            autoUpdate: this.autoUpdate
        });
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
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
            const firstDimension = this.config.dimensions.find((dimension) => !dimension.preventSeries);
            this.setDimension(firstDimension?.id);
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
                    colorMap: this.colorMap?.getSnapshot(),
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
