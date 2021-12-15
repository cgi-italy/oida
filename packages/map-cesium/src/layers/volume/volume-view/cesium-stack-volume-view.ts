import { StackVolumeView } from '@oidajs/core';
import { CesiumVolumeView } from './cesium-volume-view';
import { CesiumVolumeTile } from '../cesium-volume-tile';
import { CesiumStackVolumeTilePrimitive } from './cesium-stack-volume-tile-primitive';

export class CesiumStackVolumeView extends CesiumVolumeView implements StackVolumeView {

    protected numSlices_: number;

    constructor(config) {
        super(config);

        this.numSlices_ = config.numSlices;
    }

    setNumSlices(numSlices: number) {
        this.numSlices_ = numSlices;
        this.updateRevision_();
    }

    destroy() {

    }

    protected createTilePrimitive_(tile: CesiumVolumeTile) {
        return new CesiumStackVolumeTilePrimitive({
            tileSet: this.tileSet_,
            tileKey: tile.getTileKey(),
            numSlices: this.numSlices_
        });
    }
}

