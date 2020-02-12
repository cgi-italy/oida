import TileLayer from 'ol/layer/Tile';

import { TILE_LAYER_ID, ITileLayerRenderer } from '@oida/core';

import { olTileSourcesFactory } from './tilesources/ol-tilesources-factory';

import { olLayersFactory } from './ol-layers-factory';
import { OLMapLayer } from './ol-map-layer';

export class OLTileLayer extends OLMapLayer<TileLayer> implements ITileLayerRenderer {

    protected onTileLoadStart_;
    protected onTileLoadEnd_;

    constructor(config) {
        super(config);
    }

    updateSource(config) {

        let prevSource = this.olImpl_.getSource();
        if (prevSource) {
            prevSource.un('tileloadstart', this.onTileLoadStart_);
            prevSource.un('tileloadend', this.onTileLoadEnd_);
            prevSource.un('tileloaderror', this.onTileLoadEnd_);
        }

        let source = config ? this.createTileSource_(config) : undefined;
        this.olImpl_.setSource(source);
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


    protected createOLObject_(config) {

        this.onTileLoadStart_ = () => {
            config.onTileLoadStart();
        };

        this.onTileLoadEnd_ = () => {
            config.onTileLoadEnd();
        };

        return new TileLayer({
            source: config.source ? this.createTileSource_(config.source) : undefined,
            extent: config.extent,
            zIndex: config.zIndex || 0
        });

    }

    protected destroyOLObject_() {
    }

    protected createTileSource_(config) {
        let source = olTileSourcesFactory.create(config.id, {
            ...config,
            wrapX: this.mapRenderer_.getViewer().getView()['wrapX']
        });

        if (source) {
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
