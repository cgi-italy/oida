import { action, autorun, computed, IObservableArray, makeObservable, observable } from 'mobx';

import { QueryParams as QueryCriteria, AoiSupportedGeometry, SubscriptionTracker, AOI_FIELD_ID } from '@oidajs/core';
import { AsyncDataFetcher, FeatureLayer, QueryParams, QueryParamsProps } from '@oidajs/state-mobx';

import { DatasetVectorFeature, DatasetVectorFeatureProps, VectorFeatureDescriptor } from '../dataset-map-viz';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';

const aimIcon =
    'data:image/png;base64,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Y29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6Y2FlZWM2YmItM2RlYi00ZGU2LTg3YzMtMzc3MmJiMmZmNjMzIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJiNWJkNmU4LTRjMWEtNDAxNi1iODRiLTJjN2JlZjE5YTIzMSIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjNmY2I4NDY5LWQzN2EtNGE0Mi04ZmI4LWY5ZTNhNWI3NjYwZiIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjk1ODE0ODgyODU4MjkzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMzIiCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzOjA5OjI3VDEzOjQxOjIyKzAyOjAwIgogICB4bXA6TW9kaWZ5RGF0ZT0iMjAyMzowOToyN1QxMzo0MToyMiswMjowMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjBhMTRhOWQ4LWQzYzgtNGY4Zi1iOWZiLTcwNzc5M2FmNDY0YSIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0wOS0yN1QxMzo0MToyMiIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz43hEtoAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAKyUAACslAEp1hDxAAAAB3RJTUUH5wkbCykW8Vr2LgAABMNJREFUWMOtV19IW2cUP/cmlkpiaYWh/O5N52h9iFKK+iKbFEKhsqEPNfrgUFcIDB869GHQjLGVIcynUZoWSnEPErBllcooWmhwabt5H4rgZE0JQ2ESTOISI4sx/km89+wl6bT3GhPdebrce77zO9+5v+93zidQiQbA2dTU9Ki5uVnc+97v92eDwaAjEokopcQzU+n2QV9fn9jZ2bnvpdVqNQeDwfeJqKQExBJ3byYiSwEXqyRJpv89AQBWANeI6BeLxXKjoqJC53PmzBmhvLz8B2Z+CqATwEk6rkmSZAbQBeD14OCgOjs7y5ubm3yQra+vs6Io3N/fvwvgFYArsiyLRwIHYAFwr62tLTM/P8+apnGxpqoqz8zMsMPh2AIwJEnSiaOAP3C73VoymeSjWjweZ5fLpQK4XXQSubLfc7vdWjqd5uNaMpnMJ3HTZrPpfodgsPuuxsbGsbGxsbJTp04ZJhmLxWhhYYGi0SiJokhVVVVkt9upsrLyQP+urq7NxcXFTyKRyMvD2P56fn7ecDdra2s8PDysAVgB8AjAtwC+A/CzJEmrHo+HU6mU4doXL14wAL8kSWWFErg2ODioGhEuFArx5cuXdwDcAvDe2bNn31bPZrOJAGQAo93d3buJREK3PpPJsNPpzAJoPVBkALycnZ013HkO/AtZlk0F+FMGYKinp2fXiD8+n48B/CRJkrhP2wF8CeBmbW3tptE5z5X9ViHwd5J46PV6dXFWV1cZQALAVznMj4X29na1r69PJCKqqKig1tZWHYEaGhr+JqILkUgkXuQxPm8ymX4PBoNWi2W/ck9MTJCmacTMNDIyopqbm5t1jWWvLSwsEBH9ajabV4vVEUEQ/lJV9Y+lpaUP6+vr933r6Oh4+zw3N2c6VCaj0SgRUSAUCnGxCYTDYZWIArFY7PjNSBRFIiLTEdTcJAjC8ROoqqoiIrpopGKF1JSILlZXVx8+kPj9/qzVajXnW2pvb+8+B7vdToIgtKiqCiJaLiYBZrafPn26vqamRvft7t27lNMZUhQlQwA+AvApgM/PnTuXWl9f1x0fj8fDAEYLqth/J6AcwNPx8XFdnJWVFc6p6Gc5zKa9ZTMBeKYoim5hKpXi7u7u3VxrLTsE/P7AwIC2s7OjizM5OckARmVZFg4K0Nnf37+rqqpucSKR4J6enl0ADwGc3zt65TroBQBPBwYGNKMqbm9vc1tb2w6AlkLlOwng1czMjGFDSafT7PV62WazpQD8BuA+gB8BvKqrq9scHx9no50zM09NTTGAJzmCFvyHVxwOx1Y8Hj+wx29sbHAgEGC/38/Pnz/nQCDAW1tbB/qHQiG22+3/AGg8lMGyLIsAhlwul3qcaWgv8a5evZoFcL2mpkYo9hyfAHDb5XKp0Wj0yOChUCgP/nWp43o+iW8uXbqUnp6e5kwmUzTw9vY2T01N5ct+vWTwPYOGAKAFgN/pdGZ9Ph/HYrGC5Z6cnMyz/QmAxqLLXkSPbwXwAEDi8ePHOvA7d+7kRWYUQMuhbC/lbhgOh7NE9EySJB8zuzVN+/5dH03TmIhuiKLoXV5eLrpzlnRrCYfDTERZZjbSfyKibCngR70dvxkZGVHn5ub2EUtRlAwR/VlqsH8Bojf74X0pDuEAAAAASUVORK5CYII=';

export const DATASET_VECTOR_FEATURE_LIST_PROCESSING = 'dataset_vector_feature_list_processing';

export type DatasetVectorFeatureListData = {
    total: number;
    features: DatasetVectorFeatureProps[];
};
export type DatasetVectorFeatureListProvider = (params: QueryCriteria) => Promise<DatasetVectorFeatureListData>;

export type DatasetVectorFeatureListConfig = {
    supportedGeometries: AoiSupportedGeometry[];
    provider: DatasetVectorFeatureListProvider;
    featureDescriptor?: VectorFeatureDescriptor;
};

export type DatasetVectorFeatureListProps = Omit<
    DatasetProcessingProps<typeof DATASET_VECTOR_FEATURE_LIST_PROCESSING, DatasetVectorFeatureListConfig>,
    'dimensions' | 'currentVariable'
> & {
    queryParams?: QueryParams | QueryParamsProps;
};

export class DatasetVectorFeatureList extends DatasetProcessing<
    typeof DATASET_VECTOR_FEATURE_LIST_PROCESSING,
    FeatureLayer<DatasetVectorFeature>
> {
    readonly config: DatasetVectorFeatureListConfig;
    public queryParams: QueryParams;
    readonly data: IObservableArray<DatasetVectorFeature>;

    protected readonly dataFetcher_: AsyncDataFetcher<DatasetVectorFeatureListData, QueryCriteria>;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetVectorFeatureListProps, 'vizType'>) {
        super({
            vizType: DATASET_VECTOR_FEATURE_LIST_PROCESSING,
            ...props
        });

        this.config = props.config;
        this.queryParams = props.queryParams instanceof QueryParams ? props.queryParams : new QueryParams(props.queryParams);
        this.data = observable.array([], {
            deep: false
        });
        this.mapLayer.setSource(this.data);

        this.dataFetcher_ = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return this.config.provider(params);
            }
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();
    }

    get loadingState() {
        return this.dataFetcher_.loadingStatus;
    }

    retrieveData() {
        let queryCriteria = this.queryParams.data;
        const aoi = this.aoi?.geometry.value;
        if (aoi) {
            queryCriteria = {
                ...queryCriteria,
                filters: [
                    ...(queryCriteria.filters || []),
                    {
                        key: 'the_geom',
                        type: AOI_FIELD_ID,
                        value: {
                            geometry: aoi
                        }
                    }
                ]
            };
        }
        return this.dataFetcher_
            .fetchData(queryCriteria)
            .then((response) => {
                this.setData_(response);
                return response;
            })
            .catch(() => {
                this.setData_(undefined);
            });
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    clone(): this {
        return this.clone_({
            config: this.config
        });
    }

    @action
    protected setData_(data: DatasetVectorFeatureListData | undefined) {
        this.queryParams.paging.setTotal(data?.total || 0);
        this.data.replace(data?.features.map((feature) => new DatasetVectorFeature(feature)) || []);
    }

    protected initMapLayer_(): FeatureLayer<DatasetVectorFeature> {
        return new FeatureLayer<DatasetVectorFeature>({
            id: `${this.id}_layer`,
            config: {
                geometryGetter: (feature) => feature.geometry,
                styleGetter: (feature) => {
                    return {
                        point: {
                            url: aimIcon,
                            color: [1, 1, 1],
                            scale: 1,
                            visible: feature.selected.value,
                            pickingDisabled: true
                        },
                        polygon: {
                            strokeWidth: 2,
                            strokeColor: [1, 1, 0],
                            visible: feature.selected.value,
                            pickingDisabled: true,
                            fillColor: [1, 1, 0, 0.5]
                        }
                    };
                }
            }
        });
    }

    protected afterInit_() {
        const dataUpdateDisposer = autorun(() => {
            this.retrieveData();
        });
        this.dataFetcher_.setDebounceInterval(1000);

        this.subscriptionTracker_.addSubscription(dataUpdateDisposer);
    }
}

export type DatasetVectorFeatureListAnalysisProps = {
    processing?: DatasetVectorFeatureList | Omit<DatasetVectorFeatureListProps, 'vizType'>;
} & Omit<DatasetAnalysisProps<typeof DATASET_VECTOR_FEATURE_LIST_PROCESSING, DatasetVectorFeatureList>, 'type' | 'processings'>;

export class DatasetVectorFeatureListAnalysis extends DatasetAnalysis<
    typeof DATASET_VECTOR_FEATURE_LIST_PROCESSING,
    DatasetVectorFeatureList
> {
    constructor(props: DatasetVectorFeatureListAnalysisProps) {
        super({
            type: DATASET_VECTOR_FEATURE_LIST_PROCESSING,
            ...props
        });

        if (props.processing) {
            if (props.processing instanceof DatasetVectorFeatureList) {
                this.setProcessing(props.processing);
            } else {
                this.setProcessing(new DatasetVectorFeatureList(props.processing));
            }
        }
    }

    @action
    setProcessing(processing: DatasetVectorFeatureList | undefined) {
        this.processing?.dispose();
        if (processing) {
            this.processings.replace([processing]);
        } else {
            this.processings.clear();
        }
    }

    @computed
    get processing() {
        return this.processings.length === 1 ? this.processings[0] : undefined;
    }

    addProcessing() {
        throw new Error('DatasetVectorFeatureListAnalysis: cannot invoke addProcessing directly. Use setProcessing instead');
    }

    removeProcessing() {
        throw new Error('DatasetVectorFeatureListAnalysis: cannot invoke removeProcessing');
    }
}
