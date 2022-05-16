import { autorun } from 'mobx';

import { TileSource, SubscriptionTracker, LoadingState, TileSourceTypes } from '@oidajs/core';
import { GroupLayer, TileLayer } from '@oidajs/state-mobx';

import { DatasetDimension, DatasetViz, DatasetVizProps, DimensionDomainType } from '../common';
import { getRasterBandModeFromConfig } from '../utils';
import { RasterBandModeConfig, RasterBandMode, RasterBandModeType } from './raster-band-mode';

export const RASTER_VIZ_TYPE = 'dataset_raster_viz';

export type RasterSourceProviderResponseItem<TYPE extends TileSourceTypes = TileSourceTypes> = {
    config: TileSource<TYPE>;
    geographicExtent?: number[];
    minZoomLevel?: number;
    maxZoomLevel?: number;
};

export type RasterSourceProvider<TYPE extends TileSourceTypes = TileSourceTypes> = (
    rasterViz: RasterMapViz
) => Promise<RasterSourceProviderResponseItem<TYPE> | RasterSourceProviderResponseItem<TYPE>[] | undefined>;

export type RasterMapVizConfig = {
    bandMode: RasterBandModeConfig;
    dimensions?: DatasetDimension<DimensionDomainType>[];
    rasterSourceProvider: RasterSourceProvider;
    afterInit?: (rasterViz: RasterMapViz) => void;
};

export type RasterMapVizProps = Omit<
    DatasetVizProps<typeof RASTER_VIZ_TYPE, RasterMapVizConfig>,
    'dimensions' | 'currentVariable' | 'initDimensions'
>;

export class RasterMapViz extends DatasetViz<GroupLayer> {
    readonly config: RasterMapVizConfig;
    readonly bandMode: RasterBandMode;

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<RasterMapVizProps, 'vizType'>) {
        super({
            ...props,
            dimensions: props.config.dimensions,
            currentVariable: () => (this.bandMode.value?.type === RasterBandModeType.Single ? this.bandMode.value.band : undefined),
            initDimensions: true,
            dimensionValues: props.dimensionValues,
            vizType: RASTER_VIZ_TYPE
        });

        this.config = props.config;

        this.bandMode = new RasterBandMode();

        getRasterBandModeFromConfig({
            config: props.config.bandMode
        }).then((bandModeProps) => {
            this.bandMode.setValue(bandModeProps);
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        this.afterInit_();
    }

    dispose() {
        super.dispose();
        this.subscriptionTracker_.unsubscribe();
    }

    protected initMapLayer_() {
        return new GroupLayer({
            id: `${this.dataset.id}raster`
        });
    }

    protected afterInit_() {
        const sourceUpdateDisposer = autorun(
            () => {
                this.mapLayer.loadingStatus.update({
                    value: LoadingState.Loading,
                    percentage: 30
                });
                this.config
                    .rasterSourceProvider(this)
                    .then((source) => {
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

                                layer.setSource(undefined);
                                layer.setExtent(item.geographicExtent);
                                layer.setMinZoomLevel(item.minZoomLevel);
                                layer.setMaxZoomLevel(item.maxZoomLevel);
                                layer.setSource(item.config);
                            });
                        } else {
                            this.mapLayer.children.items.forEach((layer) => {
                                (layer as TileLayer).setSource(undefined);
                            });
                        }
                        this.mapLayer.loadingStatus.setValue(LoadingState.Init);
                    })
                    .catch((error) => {
                        this.mapLayer.children.items.forEach((layer) => {
                            (layer as TileLayer).setSource(undefined);
                        });
                        this.mapLayer.loadingStatus.update({
                            value: LoadingState.Error,
                            message: error.message
                        });
                    });
            },
            {
                delay: 1000
            }
        );

        const loadingStateUpdateDisposer = autorun(() => {
            let loadingState = LoadingState.Success;
            let percentage = 100;
            let message = '';
            for (const item of this.mapLayer.children.items) {
                const itemState = item.loadingStatus.value;
                if (itemState === LoadingState.Loading) {
                    loadingState = LoadingState.Loading;
                    percentage = (item.loadingStatus.percentage * percentage) / 100;
                } else if (itemState === LoadingState.Error) {
                    loadingState = LoadingState.Error;
                    message = item.loadingStatus.message;
                    break;
                }
            }

            setTimeout(() => {
                this.mapLayer.loadingStatus.update({
                    value: loadingState,
                    percentage: percentage,
                    message: message
                });
            }, 0);
        });

        this.subscriptionTracker_.addSubscription(sourceUpdateDisposer);
        this.subscriptionTracker_.addSubscription(loadingStateUpdateDisposer);

        if (this.config.afterInit) {
            this.config.afterInit(this);
        }
    }
}
