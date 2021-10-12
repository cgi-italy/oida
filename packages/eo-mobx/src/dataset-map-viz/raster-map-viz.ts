import { autorun } from 'mobx';

import { TileSource, SubscriptionTracker, LoadingState } from '@oida/core';
import { TileLayer } from '@oida/state-mobx';

import {
    DatasetDimension, DataDomain, isValueDomain,
    DatasetViz, DatasetVizProps, DatasetDimensions, DatasetDimensionsProps, HasDatasetDimensions
} from '../common';
import { getRasterBandModeFromConfig } from '../utils';
import { RasterBandModeConfig, RasterBandMode, RasterBandModeType } from './raster-band-mode';


export const RASTER_VIZ_TYPE = 'dataset_raster_viz';

export type RasterSourceProvider = (rasterViz: RasterMapViz) => Promise<({config: TileSource, geographicExtent?: number[]}) | undefined>;

export type RasterMapVizConfig = {
    bandMode: RasterBandModeConfig;
    dimensions?: DatasetDimension<DataDomain<string | number | Date>>[];
    rasterSourceProvider: RasterSourceProvider;
    afterInit?: (rasterViz: RasterMapViz) => void;
};

export type RasterMapVizProps = DatasetVizProps<typeof RASTER_VIZ_TYPE, RasterMapVizConfig> & DatasetDimensionsProps;

export class RasterMapViz extends DatasetViz<TileLayer> implements HasDatasetDimensions {

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
        return new TileLayer({
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
                this.mapLayer.setSource(source?.config);
                if (source) {
                    this.mapLayer.setExtent(source.geographicExtent);
                }
                this.mapLayer.loadingStatus.setValue(LoadingState.Init);
            }).catch((error) => {
                this.mapLayer.setSource(undefined);
                this.mapLayer.loadingStatus.update({
                    value: LoadingState.Error,
                    message: error.message
                });
            });
        }, {
            delay: 1000
        });

        this.subscriptionTracker_.addSubscription(sourceUpdateDisposer);

        if (this.config.afterInit) {
            this.config.afterInit(this);
        }
    }
}
