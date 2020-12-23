import { autorun, observable, makeObservable, action, runInAction, computed } from 'mobx';

import { Geometry, AoiSupportedGeometry } from '@oida/core';
import { AsyncDataFetcher } from '@oida/state-mobx';

import { DatasetVariable, DatasetDimension, DataDomain, DomainRange, isValueDomain } from '../types';
import { DatasetDimensions, HasDatasetDimensions, DatasetDimensionsProps } from './dataset-dimensions';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { getDatasetVariableDomain } from '../utils';
import { DatasetViz } from './dataset-viz';


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
    variables: DatasetVariable<DataDomain<number>>[];
    dimensions: DatasetDimension<DataDomain<T>>[];
};

export type DatasetDimensionSeriesProps = {
    config: DatasetDimensionSeriesConfig;
    seriesDimension?: string;
    seriesVariable?: string;
    seriesRange?: DomainRange<SeriesDimensionType>;
} & Omit<DatasetAnalysisProps, 'vizType'> & DatasetDimensionsProps;

export class DatasetDimensionSeries extends DatasetAnalysis<undefined> implements HasDatasetDimensions {

    readonly config: DatasetDimensionSeriesConfig;
    readonly dimensions: DatasetDimensions;
    @observable.ref seriesDimension: string | undefined;
    @observable.ref seriesVariable: string | undefined;
    @observable.ref seriesRange: DomainRange<SeriesDimensionType> | undefined;
    @observable.ref data: DatasetDimensionSeriesData<SeriesDimensionType>;

    protected dataFetcher_: AsyncDataFetcher<DatasetDimensionSeriesData | undefined>;

    constructor(props: DatasetDimensionSeriesProps) {
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
        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: () => {
                if (this.canRunQuery_()) {
                    return this.config.provider({
                        dimension: this.seriesDimension!,
                        geometry: this.geometry!,
                        variable: this.seriesVariable!,
                        range: this.seriesRange,
                        dimensionValues: this.dimensions.values
                    });
                } else {
                    return Promise.resolve(undefined);
                }
            },
            debounceInterval: 1000
        });

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    @action
    setDimension(dimension: string | undefined) {
        this.seriesDimension = dimension;
        if (dimension) {
            this.dimensions.unsetValue(dimension);

            let dimensionConfig = this.config.dimensions?.find(dim => dim.id === dimension);

            if (dimensionConfig) {
                getDatasetVariableDomain(dimensionConfig).then((domain) => {
                    if (domain && isValueDomain(domain)) {
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
        this.seriesVariable = variable;
    }

    @action
    setRange(range: DomainRange<SeriesDimensionType> | undefined) {
        this.seriesRange = range;
    }

    clone() {
        return this.clone_({
            config: this.config,
            seriesDimension: this.seriesDimension,
            seriesVariable: this.seriesVariable,
            seriesRange: this.seriesRange,
            dimensionValues: this.dimensions.values
        }) as DatasetDimensionSeries;
    }

    protected afterInit_() {
        const seriesUpdaterDisposer = autorun(() => {

            if (this.canRunQuery_()) {

                this.dataFetcher_.fetchData().then(data => {
                    runInAction(() => {
                        this.data = data || [];
                    });
                });
            }
        });
    }
    protected canRunQuery_ = () => {
        return this.seriesDimension
            && this.geometry
            && this.seriesVariable
            && this.config.dimensions.every((dim) => {
                return (dim.id === this.seriesDimension) || this.dimensions.values.has(dim.id);
            });
    }

    protected initMapLayer_() {
        return undefined;
    }
}

DatasetViz.register(DIMENSION_SERIES_TYPE, DatasetDimensionSeries);