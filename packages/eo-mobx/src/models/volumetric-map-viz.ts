import { autorun, observable, action, makeObservable } from 'mobx';

import { VolumeSourceConfig, SubscriptionTracker } from '@oida/core';
import { VolumeLayer, StackVolumeViewMode, VolumeColorMap } from '@oida/state-mobx';

import { DatasetViz, DatasetVizProps } from './dataset-viz';
import { RasterBandConfig, RasterBandModeSingle, RasterBandModeSingleProps } from './raster-band-mode';
import { VerticalScaleProps, VerticalScale } from './vertical-scale';
import { getRasterBandSingleConfig } from '../utils/get-raster-band-mode-from-config';

export const VOLUMETRIC_VIZ_TYPE = 'volumetric';

type DataVerticalDomain = {
    min: number;
    max: number;
    step?: number;
};

export type VolumetricMapVizConfig = {
    bands: RasterBandConfig[];
    verticalDomain: DataVerticalDomain;
    volumeSourceProvider: (volumetricViz: DatasetVolumetricViz) => VolumeSourceConfig | undefined;
    verticalScaleConfig?: {
        min: number,
        max: number,
        step?: number,
        default?: number
    },
    afterInit?: (volumetricViz: DatasetVolumetricViz) => void;
};

export type DatasetVolumetricVizProps = {
    bandMode?: RasterBandModeSingleProps | RasterBandModeSingle;
} & DatasetVizProps<typeof VOLUMETRIC_VIZ_TYPE, VolumetricMapVizConfig> & VerticalScaleProps;

export class DatasetVolumetricViz extends DatasetViz<VolumeLayer> {
    readonly config: VolumetricMapVizConfig;
    @observable verticalScale: VerticalScale;
    @observable.ref bandMode: RasterBandModeSingle | undefined;

    protected subscriptionTracker_: SubscriptionTracker;

    constructor(props: Omit<DatasetVolumetricVizProps, 'vizType'>) {
        super({
            ...props,
            vizType: VOLUMETRIC_VIZ_TYPE
        });

        this.config = props.config;
        this.verticalScale = new VerticalScale(props);

        this.bandMode = undefined;
        if (props.bandMode) {
            this.setBandMode(props.bandMode);
        } else {
            getRasterBandSingleConfig({
                bands: this.config.bands
            }).then((modeProps) => {
                this.setBandMode(modeProps);
            });
        }

        this.subscriptionTracker_ = new SubscriptionTracker();

        makeObservable(this);

        this.afterInit_();

    }

    @action
    setBandMode(bandMode: RasterBandModeSingleProps | RasterBandModeSingle | undefined) {
        if (bandMode) {
            this.bandMode = bandMode instanceof RasterBandModeSingle ? bandMode : new RasterBandModeSingle(bandMode);
        } else {
            this.bandMode = undefined;
        }
    }

    dispose() {
        this.subscriptionTracker_.unsubscribe();
    }

    protected getLayerColorMap_() {
        const bandMode = this.bandMode;
        if (bandMode) {
            const bandConfig = this.config.bands.find(band => band.id === bandMode.band);
            if (bandConfig) {
                const colorScaleConfig = bandConfig.colorScales?.find(colorScale => colorScale.id === bandMode.colorMap.colorScale);
                const domain = bandMode.colorMap.domain;
                if (colorScaleConfig && domain) {
                    return new VolumeColorMap({
                        colorScale: colorScaleConfig.legend,
                        mapRange: domain.mapRange,
                        clamp: domain.clamp,
                        noDataValue: domain.noDataValue
                    });
                }
            }
        }
    }

    protected afterInit_() {
        const sourceUpdateDisposer = autorun(() => {
            let sourceConfig = this.config.volumeSourceProvider(this);
            this.mapLayer.setSource(sourceConfig);
        });

        const colormapUpdateDisposer = autorun(() => {
            let layerColorMap = this.getLayerColorMap_();
            if (layerColorMap) {
                this.mapLayer.setColorMap(layerColorMap);
            }
        });

        const verticalScaleUpdater = autorun(() => {
            this.mapLayer.setVerticalScale(this.verticalScale.value);
        });

        this.subscriptionTracker_.addSubscription(sourceUpdateDisposer);
        this.subscriptionTracker_.addSubscription(colormapUpdateDisposer);
        this.subscriptionTracker_.addSubscription(verticalScaleUpdater);

        if (this.config.afterInit) {
            this.config.afterInit(this);
        }
    }

    protected initMapLayer_(props: DatasetVolumetricVizProps) {
        return new VolumeLayer({
            id: `${this.dataset.id}volumetricProfileView`,
            viewMode: new StackVolumeViewMode({
                numSlices: 8
            }),
            verticalScale: props.verticalScale,
            colorMap: this.getLayerColorMap_()
        });
    }

}

