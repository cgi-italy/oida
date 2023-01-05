import { SliceVolumeView } from '@oidajs/core';

import { CesiumVolumeView } from './cesium-volume-view';
import { CesiumVolumeTile } from '../cesium-volume-tile';
import { CesiumSliceVolumeTilePrimitive } from './cesium-slice-volume-tile-primitive';

export class CesiumSliceVolumeView extends CesiumVolumeView implements SliceVolumeView {
    protected slicePrimitive_: CesiumSliceVolumeTilePrimitive | undefined;
    protected slices_: { x?: number; y?: number; z?: number };

    constructor(config) {
        super(config);
        this.slices_ = {
            x: undefined,
            y: undefined,
            z: undefined
        };
    }

    setXSlice(xSlice: number | undefined) {
        this.slices_.x = xSlice;
        this.updateRevision_();
    }

    setYSlice(ySlice: number | undefined) {
        this.slices_.y = ySlice;
        this.updateRevision_();
    }

    setZSlice(zSlice: number | undefined) {
        this.slices_.z = zSlice;
        this.updateRevision_();
    }

    destroy() {
        return;
    }

    protected createTilePrimitive_(tile: CesiumVolumeTile) {
        this.slicePrimitive_ = new CesiumSliceVolumeTilePrimitive({
            tileSet: this.tileSet_,
            tileKey: tile.getTileKey(),
            xSlice: this.slices_.x,
            ySlice: this.slices_.y,
            zSlice: this.slices_.z
        });

        return this.slicePrimitive_;
    }
}
