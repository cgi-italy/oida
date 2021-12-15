import TileLayer from 'ol/layer/Tile';

import { TILE_LAYER_ID, ITileLayerRenderer, MapLayerRendererConfig, TileLayerRendererConfig, TileSource } from '@oidajs/core';

import { olTileSourcesFactory } from './tilesources/ol-tilesources-factory';

import { olLayersFactory } from './ol-layers-factory';
import { OLMapLayer } from './ol-map-layer';

export class OLTileLayer extends OLMapLayer<TileLayer> implements ITileLayerRenderer {

    protected onTileLoadStart_: (() => void) | undefined;
    protected onTileLoadEnd_: (() => void) | undefined;

    constructor(config: TileLayerRendererConfig) {
        super(config);
    }

    updateSource(sourceConfig: TileSource) {

        let prevSource = this.olImpl_.getSource();
        if (prevSource) {
            prevSource.un('tileloadstart', this.onTileLoadStart_);
            prevSource.un('tileloadend', this.onTileLoadEnd_);
            prevSource.un('tileloaderror', this.onTileLoadEnd_);
        }

        let source = sourceConfig ? this.createTileSource_(sourceConfig) : undefined;
        this.olImpl_.setSource(source);
    }

    setMinZoomLevel(level: number | undefined) {
        this.olImpl_.setMinZoom(level);
    }

    setMaxZoomLevel(level: number | undefined) {
        this.olImpl_.setMaxZoom(level);
    }

    forceRefresh() {
        let source = this.olImpl_.getSource();
        if (source) {
            for (const id in source.tileCacheForProjection) {
                source.tileCacheForProjection[id].pruneExceptNewestZ();
            }
            source.setKey(new Date().toISOString());
        }
    }


    protected createOLObject_(config: TileLayerRendererConfig) {

        this.onTileLoadStart_ = config.onTileLoadStart;
        this.onTileLoadEnd_ = config.onTileLoadEnd;

        return new TileLayer({
            source: config.source ? this.createTileSource_(config.source) : undefined,
            extent: config.extent,
            zIndex: config.zIndex || 0,
            minZoom: config.minZoomLevel,
            maxZoom: config.maxZoomLevel
        });

    }

    protected destroyOLObject_() {
    }

    protected createTileSource_(config: TileSource) {
        let source = olTileSourcesFactory.create(config.id, {
            ...config,
            wrapX: this.mapRenderer_.getViewer().getView()['wrapX']
        });

        if (source && this.onTileLoadStart_ && this.onTileLoadEnd_) {
            source.on('tileloadstart', this.onTileLoadStart_);
            source.on('tileloadend', this.onTileLoadEnd_);
            source.on('tileloaderror', this.onTileLoadEnd_);
        }

        return source;
    }

}

olLayersFactory.register(TILE_LAYER_ID, (config) => {
    return new OLTileLayer(config);
});
