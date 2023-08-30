import { AoiSupportedGeometry, BBoxGeometry, CircleGeometry, SubscriptionTracker } from '@oidajs/core';
import { AsyncDataFetcher } from '@oidajs/state-mobx';
import { action, autorun, computed, makeObservable, observable } from 'mobx';
import { EnumFeaturePropertyDescriptor } from '../dataset-map-viz';
import { DatasetAnalysis, DatasetAnalysisProps } from './dataset-analysis';
import { DatasetProcessing, DatasetProcessingProps } from './dataset-processing';

export const DATASET_AREA_DISTRIBUTION_PROCESSING = 'dataset_area_distribution_processing';

export type DatasetAreaDistributionRequest = {
    variable: string;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry;
};

export type DatasetAreaDistributionData = {
    name: string;
    count: number;
};

export type DatasetAreaDistributionProvider = (request: DatasetAreaDistributionRequest) => Promise<DatasetAreaDistributionData[]>;

export type DatasetAreaDistributionConfig = {
    variables: EnumFeaturePropertyDescriptor[];
    supportedGeometries: AoiSupportedGeometry[];
    provider: DatasetAreaDistributionProvider;
};

export type DatasetAreaDistributionProps = Omit<
    DatasetProcessingProps<typeof DATASET_AREA_DISTRIBUTION_PROCESSING, DatasetAreaDistributionConfig>,
    'dimensions' | 'currentVariable'
> & {
    variable?: string;
    autoUpdate?: boolean;
};

export class DatasetAreaDistribution extends DatasetProcessing<typeof DATASET_AREA_DISTRIBUTION_PROCESSING, undefined> {
    readonly config: DatasetAreaDistributionConfig;
    @observable.ref variable: string | undefined;
    @observable.ref data: DatasetAreaDistributionData[] | undefined;
    @observable.ref autoUpdate: boolean;

    protected dataFetcher_: AsyncDataFetcher<DatasetAreaDistributionData[] | undefined, DatasetAreaDistributionRequest>;
    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetAreaDistributionProps, 'vizType'>) {
        super({
            vizType: DATASET_AREA_DISTRIBUTION_PROCESSING,
            currentVariable: () => this.variable,
            ...props
        });

        this.config = props.config;
        this.variable = props.variable;
        if (!this.variable) {
            this.variable = props.config.variables[0].id;
        }

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

    clone(): this {
        return this.clone_({
            config: this.config,
            variable: this.variable,
            autoUpdate: this.autoUpdate
        });
    }

    getSnapshot() {
        return {
            ...super.getSnapshot(),
            variable: this.variable
        };
    }

    dispose(): void {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    retrieveData() {
        this.dataFetcher_
            .fetchData({
                variable: this.variable!,
                geometry: this.aoi!.geometry.value as GeoJSON.Polygon | GeoJSON.MultiPolygon | CircleGeometry | BBoxGeometry
            })
            .then((data) => {
                this.setData(data);
            })
            .catch(() => {
                this.setData(undefined);
            });
    }

    @computed
    get canRunQuery(): boolean {
        return !!this.aoi?.geometry.value && !!this.variable;
    }

    @action
    protected setData(data: DatasetAreaDistributionData[] | undefined) {
        this.data = data;
    }

    protected afterInit_() {
        if (!this.variable) {
            this.setVariable(this.config.variables[0].name);
        }

        const statsUpdaterDisposer = autorun(() => {
            if (this.autoUpdate) {
                this.retrieveData();
            }
        });

        this.subscriptionTracker_.addSubscription(statsUpdaterDisposer);
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
