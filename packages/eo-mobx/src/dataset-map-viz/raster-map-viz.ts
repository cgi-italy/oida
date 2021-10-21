import { autorun } from 'mobx';

import { TileSource, SubscriptionTracker, LoadingState } from '@oida/core';
import { GroupLayer, TileLayer } from '@oida/state-mobx';

import {
    DatasetDimension, DataDomain, isValueDomain,
    DatasetViz, DatasetVizProps, DatasetDimensions, DatasetDimensionsProps, HasDatasetDimensions
} from '../common';
import { getRasterBandModeFromConfig } from '../utils';
import { RasterBandModeConfig, RasterBandMode, RasterBandModeType } from './raster-band-mode';


export const RASTER_VIZ_TYPE = 'dataset_raster_viz';

export type RasterSourceProviderResponseItem = {
    config: TileSource,
    geographicExtent?: number[],
    minZoomLevel?: number;
    maxZoomLevel?: number;
};

export type RasterSourceProvider = (rasterViz: RasterMapViz) => Promise<
    RasterSourceProviderResponseItem | RasterSourceProviderResponseItem[] | undefined
>;

export type RasterMapVizConfig = {
    bandMode: RasterBandModeConfig;
    dimensions?: DatasetDimension<DataDomain<string | number | Date>>[];
    rasterSourceProvider: RasterSourceProvider;
    afterInit?: (rasterViz: RasterMapViz) => void;
};

export type RasterMapVizProps = DatasetVizProps<typeof RASTER_VIZ_TYPE, RasterMapVizConfig> & DatasetDimensionsProps;

export class RasterMapViz extends DatasetViz<GroupLayer> implements HasDatasetDimensions {

    readonly config: RasterMapVizConfig;
    readonly dimensions: DatasetDimensions;
    readonly bandMode: RasterBandMode;

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<RasterMapVizProps, 'vizType'>) {
        super({
            ...props,
            vizType: RASTER_VIZ_TYPE
        });

        this.config = props.config;

        this.bandMode = new RasterBandMode();

        this.dimensions = new DatasetDimensions({
            dataset: this.dataset,
            dimensionValues: props.dimensionValues,
            dimensions: props.config.dimensions,
            currentVariable: () => (this.bandMode.value?.type === RasterBandModeType.Single ? this.bandMode.value.band : undefined),
            initDimensions: true
        });


        getRasterBandModeFromConfig({
            config: props.config.bandMode
        }).then((bandModeProps) => {
            this.bandMode.setValue(bandModeProps);
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();

    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
        this.dimensions.dispose();
    }

    protected initMapLayer_() {
        return new GroupLayer({
            id: `${this.dataset.id}raster`
        });
    }

    protected initDimensionValue_(dimensionId: string, domain: DataDomain<string | number | Date>) {
        if (isValueDomain(domain)) {
            if (domain.min !== undefined) {
                this.dimensions.setValue(dimensionId, domain.min);
            }
        } else {
            this.dimensions.setValue(dimensionId, domain.values[0].value);
        }
    }

    protected afterInit_() {

        const sourceUpdateDisposer = autorun(() => {
            this.mapLayer.loadingStatus.update({
                value: LoadingState.Loading,
                percentage: 30
            });
            this.config.rasterSourceProvider(this).then((source) => {
                if (source) {
                    const sources = Array.isArray(source) ? source : [source];

                    const toRemove = this.mapLayer.children.items.slice(sources.length);
                    toRemove.forEach((layer) => {
                        this.mapLayer.children.remove(layer);
                    });
                    sources.forEach((item, idx) => {
                        let layer: TileLayer | undefined;
                        if (idx < this.mapLayer.children.items.length) {
                            layer = this.mapLayer.children.itemAt(idx) as TileLayer;
                        }
                        if (!layer) {
                            layer = new TileLayer({
                                id: `${item.config.id}_tile`
                            });
                            this.mapLayer.children.add(layer);
                        }
                        layer.setSource(item.config);
                        layer.setExtent(item.geographicExtent);
                        layer.setMinZoomLevel(item.minZoomLevel);
                        layer.setMaxZoomLevel(item.maxZoomLevel);
                    });
                } else {
                    this.mapLayer.children.items.forEach((layer) => {
                        (layer as TileLayer).setSource(undefined);
                    });
                }
                this.mapLayer.loadingStatus.setValue(LoadingState.Init);
            }).catch((error) => {
                this.mapLayer.children.items.forEach((layer) => {
                    (layer as TileLayer).setSource(undefined);
                });
                this.mapLayer.loadingStatus.update({
                    value: LoadingState.Error,
                    message: error.message
                });
            });
        }, {
            delay: 1000
        });

        const loadingStateUpdateDisposer = autorun(() => {
            let loadingState = LoadingState.Success;
            let percentage  = 100;
            let message = '';
            for (let item of this.mapLayer.children.items) {
                const itemState = item.loadingStatus.value;
                if (itemState === LoadingState.Loading) {
                    loadingState = LoadingState.Loading;
                    percentage = item.loadingStatus.percentage * percentage / 100;
                } else if (itemState === LoadingState.Error) {
                    loadingState = LoadingState.Error;
                    message = item.loadingStatus.message;
                    break;
                }
            }

            setImmediate(() => {
                this.mapLayer.loadingStatus.update({
                    value: loadingState,
                    percentage: percentage,
                    message: message
                });
            });
        });

        this.subscriptionTracker_.addSubscription(sourceUpdateDisposer);
        this.subscriptionTracker_.addSubscription(loadingStateUpdateDisposer);

        if (this.config.afterInit) {
            this.config.afterInit(this);
        }
    }
}
