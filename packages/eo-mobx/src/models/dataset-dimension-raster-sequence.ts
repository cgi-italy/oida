import { autorun, observable, makeObservable, action, computed, reaction } from 'mobx';

import { Geometry, AoiSupportedGeometry, LoadingState, SubscriptionTracker } from '@oida/core';
import { AsyncDataFetcher } from '@oida/state-mobx';

import { DatasetDimension, DataDomain, DomainRange, isValueDomain } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { getDatasetVariableDomain, getRasterBandSingleConfig } from '../utils';
import { ColorMap, ColorMapProps } from './color-map';
import { RasterBandConfig, RasterBandModeType } from './raster-band-mode';
import { DatasetStats } from './dataset-stats-analysis';
import { RasterMapViz } from './raster-map-viz';


export const DIMENSION_RASTER_SEQUENCE_TYPE = 'dimension_raster_sequence';

type SequenceDimensionType = string | Date | number;
type SequenceDataType = HTMLImageElement | HTMLCanvasElement | string;

export type DatasetRasterSequenceRequest<D = SequenceDimensionType> = {
    dimension: string;
    range?: DomainRange<D>;
    dimensionValues?: Map<string, SequenceDimensionType>;
    colorMap?: ColorMapProps;
    variable: string;
    geometry: Geometry;
};

export type DatasetRasterSequenceItem<D = SequenceDimensionType, T extends SequenceDataType = SequenceDataType> = {
    x: D;
    data: T;
    stats?: DatasetStats
};


export type DatasetRasterSequenceProvider<D = SequenceDimensionType, T extends SequenceDataType = SequenceDataType> =
    (request: DatasetRasterSequenceRequest<D>) => Promise<DatasetRasterSequenceItem<D, T>[]>;

export type DatasetDimensionRasterSequenceConfig<D = SequenceDimensionType, T extends SequenceDataType = SequenceDataType> = {
    provider: DatasetRasterSequenceProvider<D, T>;
    variables: RasterBandConfig[];
    supportedGeometries: AoiSupportedGeometry[],
    dimensions: DatasetDimension<DataDomain<D>>[];
};

export type DatasetDimensionRasterSequenceProps<D = SequenceDimensionType, T extends SequenceDataType = SequenceDataType> = {
    sequenceDimension?: string;
    sequenceVariable?: string;
    sequenceRange?: DomainRange<D>;
    autoUpdate?: boolean;
} & DatasetAnalysisProps<typeof DIMENSION_RASTER_SEQUENCE_TYPE, DatasetDimensionRasterSequenceConfig<D, T>> & DatasetDimensionsProps;

export class DatasetDimensionRasterSequence<
    D = SequenceDimensionType, T extends SequenceDataType = SequenceDataType
> extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly config: DatasetDimensionRasterSequenceConfig<D, T>;
    readonly dimensions: DatasetDimensions;
    @observable.ref sequenceDimension: string | undefined;
    @observable.ref sequenceVariable: string | undefined;
    @observable.ref sequenceRange: DomainRange<D> | undefined;
    @observable.ref colorMap: ColorMap | undefined;
    @observable.ref data: DatasetRasterSequenceItem<D, T>[];
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<
        DatasetRasterSequenceItem<D, T>[] | undefined, DatasetRasterSequenceRequest<D>
    >;
    protected subscriptionTracker_: SubscriptionTracker;
    protected needsUpdate_: boolean;

    constructor(props: Omit<DatasetDimensionRasterSequenceProps<D, T>, 'vizType'>) {
        super({
            vizType: DIMENSION_RASTER_SEQUENCE_TYPE,
            ...props
        });

        this.config = props.config;
        this.dimensions = new DatasetDimensions(props);
        this.sequenceDimension = props.sequenceDimension;
        this.sequenceVariable = undefined;
        this.sequenceRange = props.sequenceRange;
        this.data = [];
        this.autoUpdate = props.autoUpdate !== undefined ? props.autoUpdate : true;
        this.colorMap = undefined;
        this.setVariable(props.sequenceVariable);

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            },
            debounceInterval: this.autoUpdate ? 1000 :  0
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
    setDimension(dimension: string | undefined) {
        this.needsUpdate_ = true;
        this.sequenceDimension = dimension;
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
            this.setRange(undefined);
        }
    }

    @action
    setVariable(variable: string | undefined) {
        this.needsUpdate_ = true;
        this.sequenceVariable = variable;
        this.colorMap = undefined;

        if (variable) {
            const variableConfig = this.config.variables.find(v => v.id === variable);
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
    setRange(range: DomainRange<D> | undefined) {
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
        return !!this.sequenceDimension
        && !!this.geometry
        && !!this.sequenceVariable
        && this.config.dimensions.every((dim) => {
            return (dim.id === this.sequenceDimension) || this.dimensions.values.has(dim.id);
        });
    }

    retrieveData() {
        if (this.canRunQuery) {
            if (this.needsUpdate_) {
                this.dataFetcher_.fetchData({
                    dimension: this.sequenceDimension!,
                    geometry: this.geometry!,
                    variable: this.sequenceVariable!,
                    range: this.sequenceRange,
                    dimensionValues: new Map(this.dimensions.values),
                    colorMap: this.colorMap?.asProps()
                }).then((data) => {
                    this.setData_(data || []);
                    this.needsUpdate_ = false;
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
            sequenceDimension: this.sequenceDimension,
            sequenceVariable: this.sequenceVariable,
            sequenceRange: this.sequenceRange,
            dimensionValues: this.dimensions.values,
            autoUpdate: this.autoUpdate
        }) as DatasetDimensionRasterSequence<D, T>;
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    @action
    protected setData_(data: DatasetRasterSequenceItem<D, T>[]) {
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

        const updateTrackerDisposer = reaction(() => {
            return {
                aoi: this.geometry,
                dimensions: new Map(this.dimensions.values),
                colorMap: this.colorMap?.asProps()
            };
        }, () => {
            this.needsUpdate_ = true;
        });

        this.subscriptionTracker_.addSubscription(sequenceUpdaterDisposer);
        this.subscriptionTracker_.addSubscription(updateTrackerDisposer);
    }

    protected initMapLayer_() {
        return undefined;
    }
}

