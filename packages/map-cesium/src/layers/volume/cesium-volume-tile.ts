import { VolumeTileKey } from '@oidajs/core';

import { CesiumVolumeTileTexture } from './cesium-volume-tile-texture';
import { CesiumVolumeTileSet } from './cesium-volume-tile-set';
import { CesiumVolumeTilePrimitive } from './cesium-volume-tile-primitive';

export type CesiumVolumeTileConfig = {
    tileKey: VolumeTileKey;
    tileSet: CesiumVolumeTileSet;
    parent?: CesiumVolumeTile;
};

export class CesiumVolumeTile {
    protected tileKey_: VolumeTileKey;
    protected tileSet_: CesiumVolumeTileSet;
    protected texture_: CesiumVolumeTileTexture | undefined;
    protected textureRevision_ = -1;
    protected primitive_: CesiumVolumeTilePrimitive | undefined;
    protected primitiveRevision_ = -1;
    protected textureNeedsLoad_ = false;

    constructor(config: CesiumVolumeTileConfig) {
        this.tileKey_ = config.tileKey;
        this.tileSet_ = config.tileSet;
    }

    setTexture(texture: CesiumVolumeTileTexture | undefined, revision: number) {
        if (this.texture_) {
            this.texture_.destroy();
        }
        this.texture_ = texture;
        this.textureRevision_ = revision;

        this.textureNeedsLoad_ = true;
    }

    getTexture() {
        return this.texture_;
    }

    getTextureRevision() {
        return this.textureRevision_;
    }

    setPrimitive(primitive: CesiumVolumeTilePrimitive | undefined, revision: number) {
        if (this.primitive_) {
            this.primitive_.destroy();
        }
        this.primitive_ = primitive;
        this.primitiveRevision_ = revision;

        if (this.primitive_ && this.texture_ && this.texture_.isReady()) {
            this.primitive_.setTexture(this.texture_);
        }
    }

    getPrimitiveRevision() {
        return this.primitiveRevision_;
    }

    getTileKey() {
        return this.tileKey_;
    }

    traverse(frameState) {
        this.tileSet_.updateTileForRendering(this);
        if (this.texture_ && this.textureNeedsLoad_) {
            this.textureNeedsLoad_ = false;
            this.texture_.load(frameState.context).then(() => {
                if (this.primitive_) {
                    this.primitive_.setTexture(this.texture_);
                }
            });
        }
        if (this.primitive_) {
            this.primitive_.update(frameState);
        }
    }

    destroy() {
        if (this.texture_) {
            this.texture_.destroy();
            delete this.texture_;
        }
        if (this.primitive_) {
            this.primitive_.destroy();
            delete this.primitive_;
        }

        this.textureRevision_ = -1;
        this.primitiveRevision_ = -1;
    }
}
