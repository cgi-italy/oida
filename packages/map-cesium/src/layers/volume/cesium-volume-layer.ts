import { Cartesian2 } from 'cesium';

import { IVolumeLayerRenderer, MapLayerRendererConfig, VolumeLayerRendererConfig, VolumeSourceConfig } from '@oidajs/core';

import { CesiumMapLayer } from '../cesium-map-layer';
import { CesiumVolumeSource } from './cesium-volume-source';
import { cesiumVolumeViewFactory } from './volume-view';
import { CesiumVolumeTileSet } from './cesium-volume-tile-set';

export class CesiumVolumeLayer extends CesiumMapLayer implements IVolumeLayerRenderer {
    protected source_: CesiumVolumeSource | undefined;
    protected sourceConfig_: VolumeSourceConfig | undefined;
    protected volumeTileSet_: CesiumVolumeTileSet;
    protected onSliceLoadStart_: () => void;
    protected onSliceLoadEnd_: () => void;

    constructor(config: MapLayerRendererConfig & VolumeLayerRendererConfig) {
        super(config);

        this.onSliceLoadStart_ = config.onSliceLoadStart;
        this.onSliceLoadEnd_ = config.onSliceLoadEnd;

        const colorMap = config.colorMap;

        this.volumeTileSet_ = new CesiumVolumeTileSet({
            source: config.source
                ? new CesiumVolumeSource({
                      ...config.source,
                      onSliceLoadStart: config.onSliceLoadStart,
                      onSliceLoadEnd: config.onSliceLoadEnd
                  })
                : undefined,
            colorMap: colorMap
                ? {
                      clamp: colorMap.clamp,
                      colorMap: colorMap.image,
                      noDataValue: colorMap.noData || -Number.MAX_VALUE,
                      range: new Cartesian2(colorMap.range.min, colorMap.range.max)
                  }
                : undefined
        });
        this.primitives_.add(this.volumeTileSet_);
    }

    updateSource(sourceConfig?: VolumeSourceConfig) {
        this.volumeTileSet_.setSource(
            sourceConfig
                ? new CesiumVolumeSource({
                      ...sourceConfig,
                      onSliceLoadStart: this.onSliceLoadStart_,
                      onSliceLoadEnd: this.onSliceLoadEnd_
                  })
                : undefined
        );
    }

    forceRefresh() {
        return;
    }

    setColorMap(colorMap: HTMLImageElement | HTMLCanvasElement) {
        this.volumeTileSet_.updateColorMap({
            colorMap: colorMap
        });
        this.requestMapUpdate_();
    }

    setMapRange(range) {
        this.volumeTileSet_.updateColorMap({
            range: new Cartesian2(range.min, range.max)
        });
        this.requestMapUpdate_();
    }

    setClamp(clamp: boolean) {
        this.volumeTileSet_.updateColorMap({
            clamp: clamp
        });
        this.requestMapUpdate_();
    }

    setNoDataValue(noDataValue: number) {
        this.volumeTileSet_.updateColorMap({
            noDataValue: noDataValue
        });
        this.requestMapUpdate_();
    }

    setVerticalScale(verticalScale: number) {
        this.volumeTileSet_.setVerticalScale(verticalScale);
    }

    setViewMode(mode: string) {
        const volumeView = cesiumVolumeViewFactory.create(mode, {
            tileSet: this.volumeTileSet_,
            requestMapRender: this.requestMapUpdate_.bind(this)
        });

        this.volumeTileSet_.setVolumeView(volumeView);
        return volumeView;
    }

    protected requestMapUpdate_() {
        this.mapRenderer_.getViewer().scene.requestRender();
    }
}
