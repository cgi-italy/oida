import TileLayer from 'ol/layer/Tile';
import OLTileSource from 'ol/source/Tile';

import { TILE_LAYER_ID, ITileLayerRenderer, TileLayerRendererConfig, TileSource } from '@oidajs/core';

import { olTileSourcesFactory } from './tilesources/ol-tilesources-factory';
import { refreshTileSource } from './tilesources/ol-tilesource-utils';
import { olLayersFactory } from './ol-layers-factory';
import { OLMapLayer } from './ol-map-layer';

export class OLTileLayer extends OLMapLayer<TileLayer<OLTileSource>> implements ITileLayerRenderer {
    protected onTileLoadStart_: (() => void) | undefined;
    protected onTileLoadEnd_: (() => void) | undefined;

    constructor(config: TileLayerRendererConfig) {
        super(config);
    }

    updateSource(sourceConfig: TileSource) {
        const prevSource = this.olImpl_.getSource();
        if (prevSource) {
            if (this.onTileLoadStart_) {
                prevSource.un('tileloadstart', this.onTileLoadStart_!);
            }
            if (this.onTileLoadEnd_) {
                prevSource.un('tileloadend', this.onTileLoadEnd_);
                prevSource.un('tileloaderror', this.onTileLoadEnd_);
            }
        }

        const source = sourceConfig ? this.createTileSource_(sourceConfig) : undefined;
        this.olImpl_.setSource(source || null);
    }

    setMinZoomLevel(level: number | undefined) {
        this.olImpl_.setMinZoom(typeof level === 'number' ? level : -Infinity);
    }

    setMaxZoomLevel(level: number | undefined) {
        this.olImpl_.setMaxZoom(typeof level === 'number' ? level : Infinity);
    }

    forceRefresh() {
        const source = this.olImpl_.getSource();
        if (source) {
            refreshTileSource(source);
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
        return;
    }

    protected createTileSource_(config: TileSource) {
        const source = olTileSourcesFactory.create(config.id, {
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
