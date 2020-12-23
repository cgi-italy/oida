import { reaction } from 'mobx';

import { TileSource, SubscriptionTracker } from '@oida/core';
import { TileLayer } from '@oida/state-mobx';

import { DatasetDimension, DataDomain, isValueDomain, isDomainProvider } from '../types/dataset-variable';
import { DatasetViz, DatasetVizProps } from './dataset-viz';
import { DatasetDimensions, DatasetDimensionsProps, HasDatasetDimensions } from './dataset-dimensions';
import {
    RasterBandModeConfig, RasterBandMode
} from './raster-band-mode';
import { getRasterBandModeFromConfig } from '../utils';

export const RASTER_VIZ_TYPE = 'raster';

export type RasterMapVizConfig = {
    bandMode: RasterBandModeConfig;
    dimensions?: DatasetDimension<DataDomain<string | number | Date>>[];
    rasterSourceProvider: (rasterViz: RasterMapViz) => (TileSource & {extent?: number[]}) | undefined
    afterInit?: (rasterViz: RasterMapViz) => void;
};

export type RasterMapVizProps = {
    config: RasterMapVizConfig
} & DatasetVizProps & DatasetDimensionsProps;

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

        const sourceUpdateDisposer = reaction(
            () => this.config.rasterSourceProvider(this),
            (sourceConfig) => {
                this.mapLayer.setSource(sourceConfig);
                if (sourceConfig) {
                    this.mapLayer.setExtent(sourceConfig.extent);
                }
            },
            {
                fireImmediately: true,
                delay: 1000
            }
        );
        this.subscriptionTracker_.addSubscription(sourceUpdateDisposer);

        if (this.config.afterInit) {
            this.config.afterInit(this);
        }
    }
}

DatasetViz.register(RASTER_VIZ_TYPE, RasterMapViz);