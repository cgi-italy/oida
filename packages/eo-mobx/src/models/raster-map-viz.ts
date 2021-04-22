import { reaction, autorun } from 'mobx';

import { TileSource, SubscriptionTracker, LoadingState } from '@oida/core';
import { TileLayer } from '@oida/state-mobx';

import { DatasetDimension, DataDomain, isValueDomain, isDomainProvider } from '../types/dataset-variable';
import { DatasetViz, DatasetVizProps } from './dataset-viz';
import { DatasetDimensions, DatasetDimensionsProps, HasDatasetDimensions } from './dataset-dimensions';
import {
    RasterBandModeConfig, RasterBandMode
} from './raster-band-mode';
import { getRasterBandModeFromConfig } from '../utils';

export const RASTER_VIZ_TYPE = 'raster';

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
        this.dimensions = new DatasetDimensions(props);
        this.bandMode = new RasterBandMode();

        getRasterBandModeFromConfig({
            config: props.config.bandMode
        }).then((bandModeProps) => {
            this.bandMode.setValue(bandModeProps);
        });

        this.subscriptionTracker_ = new SubscriptionTracker();

        if (this.config.dimensions) {
            this.config.dimensions.forEach((dimension) => {
                if (dimension.domain) {
                    if (isDomainProvider(dimension.domain)) {
                        dimension.domain().then(domain => {
                            this.initDimensionValue_(dimension.id, domain);
                        });
                    } else {
                        this.initDimensionValue_(dimension.id, dimension.domain);
                    }

                }
            });
        }

        this.afterInit_();

    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected initMapLayer_() {
        return new TileLayer({
            id: `${this.dataset.id}raster`
        });
    }

    protected initDimensionValue_(dimensionId: string, domain: DataDomain<string | number | Date>) {
        if (isValueDomain(domain)) {
            this.dimensions.setValue(dimensionId, domain.min);
        } else {
            this.dimensions.setValue(dimensionId, domain[0].value);
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
