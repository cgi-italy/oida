import { ImageryLayer, Rectangle } from 'cesium';

import { ITileLayerRenderer, TileLayerRendererConfig, TileSource } from '@oidajs/core';

import { CesiumTileSource, cesiumTileSourcesFactory } from './tilesources';
import { CesiumMapLayer } from './cesium-map-layer';

export class CesiumTileLayer extends CesiumMapLayer implements ITileLayerRenderer {
    protected onTileLoadStart_: (() => void) | undefined;
    protected onTileLoadEnd_: (() => void) | undefined;
    protected extent_: number[] | undefined;
    protected minZoomLevel_: number | undefined;
    protected maxZoomLevel_: number | undefined;
    protected sourceConfig_: TileSource | undefined;

    protected source_: CesiumTileSource | undefined;

    constructor(config: TileLayerRendererConfig) {
        super(config);

        this.onTileLoadStart_ = config.onTileLoadStart;
        this.onTileLoadEnd_ = config.onTileLoadEnd;

        this.extent_ = config.extent;
        this.minZoomLevel_ = config.minZoomLevel;
        this.maxZoomLevel_ = config.maxZoomLevel;

        this.updateSource(config.source);
    }

    updateSource(sourceConfig: TileSource | undefined) {
        if (this.source_) {
            if (this.onTileLoadStart_) {
                this.source_.tileLoadStartEvent.removeEventListener(this.onTileLoadStart_, this);
            }
            if (this.onTileLoadEnd_) {
                this.source_.tileLoadEndEvent.removeEventListener(this.onTileLoadEnd_, this);
            }
        }

        this.imageries_.removeAll(false);
        this.source_ = undefined;

        try {
            const source = sourceConfig ? cesiumTileSourcesFactory.create(sourceConfig.id, sourceConfig) : undefined;
            if (source) {
                if (this.onTileLoadStart_) {
                    source.tileLoadStartEvent.addEventListener(this.onTileLoadStart_, this);
                }
                if (this.onTileLoadEnd_) {
                    source.tileLoadEndEvent.addEventListener(this.onTileLoadEnd_, this);
                }
                this.imageries_.add(new ImageryLayer(source, this.getLayerOptions_()));
            }

            this.source_ = source;
        } catch (e) {
            // do nothing
        }

        this.sourceConfig_ = sourceConfig;
    }

    forceRefresh() {
        // TODO: we reset the source and recreate the imagery layer. The reload method appears to have some issues
        // and some of the tiles are not updated correctly, so we disable it for now
        this.updateSource(this.sourceConfig_);
        // if (this.source_) {
        //     this.source_.reload();
        //     this.mapRenderer_.getViewer().scene.requestRender();
        // }
    }

    setExtent(extent: number[] | undefined) {
        this.extent_ = extent;
        if (this.source_) {
            this.imageries_.removeAll(false);
            this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
        }
    }

    setMinZoomLevel(level: number | undefined) {
        this.minZoomLevel_ = level;
        if (this.source_) {
            this.imageries_.removeAll(false);
            this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
        }
    }

    setMaxZoomLevel(level: number | undefined) {
        this.maxZoomLevel_ = level;
        if (this.source_) {
            this.imageries_.removeAll(false);
            this.imageries_.add(new ImageryLayer(this.source_, this.getLayerOptions_()));
        }
    }

    protected getLayerOptions_() {
        const options: Record<string, any> = {};
        if (this.extent_) {
            options.rectangle = Rectangle.fromDegrees(...this.extent_);
        }
        if (this.minZoomLevel_ !== undefined) {
            options.minimumTerrainLevel = this.minZoomLevel_;
        }
        if (this.maxZoomLevel_ !== undefined) {
            options.maximumTerrainLevel = this.maxZoomLevel_;
        }
        return options;
    }
}
