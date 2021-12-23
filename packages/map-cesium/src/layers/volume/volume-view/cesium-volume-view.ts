import { IVolumeViewMode } from '@oidajs/core';
import { CesiumVolumeTile } from '../cesium-volume-tile';
import { CesiumVolumeTilePrimitive } from '../cesium-volume-tile-primitive';
import { CesiumVolumeTileSet } from '../cesium-volume-tile-set';

export type CesiumVolumeViewConfig = {
    tileSet: CesiumVolumeTileSet;
    requestMapRender: () => void;
};

export abstract class CesiumVolumeView implements IVolumeViewMode {
    protected tileSet_: CesiumVolumeTileSet;
    protected requestMapRender_: () => void;
    protected revision_ = 0;

    constructor(config: CesiumVolumeViewConfig) {
        this.tileSet_ = config.tileSet;
        this.requestMapRender_ = config.requestMapRender;
    }

    updateTileForRendering(tile: CesiumVolumeTile) {
        if (tile.getPrimitiveRevision() !== this.revision_) {
            const tilePrimitive = this.createTilePrimitive_(tile);
            tile.setPrimitive(tilePrimitive, this.revision_);
        }
    }

    forceUpdate() {
        this.updateRevision_();
    }

    abstract destroy();

    protected updateRevision_() {
        this.revision_++;
        this.requestMapRender_();
    }

    protected abstract createTilePrimitive_(tile: CesiumVolumeTile): CesiumVolumeTilePrimitive;
}
