import { observe, reaction, autorun } from 'mobx';

import { VOLUME_LAYER_ID, IVolumeLayerRenderer, IMapRenderer, LoadingState } from '@oidajs/core';

import { VolumeLayer } from '../../models/map/layers/volume-layer';

import { MapLayerController } from './map-layer-controller';
import { layerControllersFactory } from './layer-controllers-factory';
import { volumeViewModeControllerFactory, VolumeViewModeController } from './volume-view-mode';

export class VolumeLayerController extends MapLayerController<IVolumeLayerRenderer, VolumeLayer> {
    protected colorMapObserverDisposer_: (() => void) | undefined;
    protected viewModeController_: VolumeViewModeController | undefined;
    protected sliceLoadingState_ = {
        pending: 0,
        loaded: 0
    };

    constructor(config) {
        super(config);
    }

    protected createLayerRenderer_(mapRenderer: IMapRenderer) {
        const onSliceLoadStart = () => {
            this.sliceLoadingState_.pending++;
            this.mapLayer_.loadingStatus.update({
                value: LoadingState.Loading,
                percentage: (this.sliceLoadingState_.loaded / this.sliceLoadingState_.pending) * 100
            });
        };

        const onSliceLoadEnd = () => {
            this.sliceLoadingState_.loaded++;
            if (this.sliceLoadingState_.pending <= this.sliceLoadingState_.loaded) {
                this.mapLayer_.loadingStatus.update({
                    value: LoadingState.Success,
                    percentage: 100
                });

                this.sliceLoadingState_.pending = 0;
                this.sliceLoadingState_.loaded = 0;
            } else {
                this.mapLayer_.loadingStatus.update({
                    value: LoadingState.Loading,
                    percentage: (this.sliceLoadingState_.loaded / this.sliceLoadingState_.pending) * 100
                });
            }
        };

        return <IVolumeLayerRenderer>mapRenderer.getLayersFactory().create(VOLUME_LAYER_ID, {
            ...this.getRendererConfig_(mapRenderer),
            source: this.mapLayer_.source,
            colorMap: this.mapLayer_.colorMap
                ? {
                      clamp: this.mapLayer_.colorMap.clamp,
                      noData: this.mapLayer_.colorMap.noDataValue,
                      range: this.mapLayer_.colorMap.mapRange,
                      image: this.mapLayer_.colorMap.colorScale
                  }
                : undefined,
            onSliceLoadStart: onSliceLoadStart,
            onSliceLoadEnd: onSliceLoadEnd
        });
    }

    protected bindToLayerState_() {
        super.bindToLayerState_();

        const layerRenderer = this.layerRenderer_!;

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapLayer_.source,
                (source) => {
                    this.resetLoadingState_();
                    layerRenderer.updateSource(source);
                },
                { fireImmediately: true }
            )
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapLayer_.verticalScale,
                (verticalScale) => {
                    this.resetLoadingState_();
                    layerRenderer.setVerticalScale(verticalScale);
                },
                { fireImmediately: true }
            )
        );

        this.subscriptionTracker_.addSubscription(
            observe(this.mapLayer_, 'sourceRevision', (change) => {
                this.resetLoadingState_();
                layerRenderer.forceRefresh();
            })
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapLayer_.colorMap,
                (colorMap) => {
                    if (this.colorMapObserverDisposer_) {
                        this.colorMapObserverDisposer_();
                        delete this.colorMapObserverDisposer_;
                    }

                    if (colorMap) {
                        const colorapDisposer = autorun(() => {
                            layerRenderer.setColorMap(colorMap.colorScale);
                        });

                        const rangeDisposer = autorun(() => {
                            layerRenderer.setMapRange(colorMap.mapRange);
                        });

                        const clampDisposer = autorun(() => {
                            layerRenderer.setClamp(colorMap.clamp);
                        });

                        const noDataDisposer = autorun(() => {
                            layerRenderer.setNoDataValue(colorMap.noDataValue || -Number.MAX_VALUE);
                        });

                        this.colorMapObserverDisposer_ = () => {
                            colorapDisposer();
                            rangeDisposer();
                            clampDisposer();
                            noDataDisposer();
                        };
                    }
                },
                { fireImmediately: true }
            )
        );

        this.subscriptionTracker_.addSubscription(
            reaction(
                () => this.mapLayer_.viewMode,
                (viewMode) => {
                    if (this.viewModeController_) {
                        this.viewModeController_.destroy();
                        delete this.viewModeController_;
                    }

                    const viewModeImplementation = layerRenderer.setViewMode(viewMode.mode);
                    if (viewModeImplementation) {
                        this.viewModeController_ = volumeViewModeControllerFactory.create(viewMode.mode, {
                            viewModeState: viewMode,
                            viewModeImplementation: viewModeImplementation
                        });
                    }
                },
                { fireImmediately: true }
            )
        );
    }

    protected unbindFromLayerState_() {
        super.unbindFromLayerState_();
        if (this.colorMapObserverDisposer_) {
            this.colorMapObserverDisposer_();
            delete this.colorMapObserverDisposer_;
        }
        if (this.viewModeController_) {
            this.viewModeController_.destroy();
            delete this.viewModeController_;
        }
    }

    protected resetLoadingState_() {
        this.sliceLoadingState_.pending = 0;
        this.sliceLoadingState_.loaded = 0;
        this.mapLayer_.loadingStatus.update({
            value: LoadingState.Success,
            percentage: 100
        });
    }
}

layerControllersFactory.register(VOLUME_LAYER_ID, (config) => {
    return new VolumeLayerController(config);
});
