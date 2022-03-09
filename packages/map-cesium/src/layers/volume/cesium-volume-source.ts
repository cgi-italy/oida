import Resource from 'cesium/Source/Core/Resource';

import { VolumeSourceConfig, VolumeTileKey, VolumeSliceData } from '@oidajs/core';

export type CesiumVolumeSlice = {
    z: number;
    data: VolumeSliceData;
};

export type CesiumVolumeSourceConfig = {
    onSliceLoadStart?: () => void;
    onSliceLoadEnd?: () => void;
} & VolumeSourceConfig;

export class CesiumVolumeSource {
    protected config_: CesiumVolumeSourceConfig;

    constructor(config: CesiumVolumeSourceConfig) {
        this.config_ = config;
    }

    getTileGrid() {
        return this.config_.tileGrid;
    }

    loadTileData(key: VolumeTileKey, onSliceReady: (slice: CesiumVolumeSlice) => void) {
        const sliceLoader = this.config_.tileSliceLoader;
        const { onSliceLoadStart, onSliceLoadEnd } = this.config_;

        const tileExtent = this.getTileExtentForKey(key);
        const slices = this.config_.tileSliceUrls(key, tileExtent);
        setTimeout(() => {
            slices.forEach((slice) => {
                // assume that the source provide image data
                if (!sliceLoader) {
                    Resource.createIfNeeded(slice.url)
                        .fetchImage()
                        .then((image) => {
                            onSliceReady({
                                z: slice.z,
                                data: image
                            });
                        });
                } else {
                    let resource: Resource;

                    if (slice.postData) {
                        resource = Resource.createIfNeeded(slice.url).post(slice.postData, {
                            responseType: 'arraybuffer',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        });
                    } else {
                        resource = Resource.createIfNeeded(slice.url).fetchArrayBuffer();
                    }

                    if (onSliceLoadStart) {
                        onSliceLoadStart();
                    }
                    resource.then(
                        (sliceData) => {
                            sliceLoader(slice, sliceData).then(
                                (textureData) => {
                                    onSliceReady({
                                        z: slice.z,
                                        data: textureData
                                    });

                                    if (onSliceLoadEnd) {
                                        onSliceLoadEnd();
                                    }
                                },
                                () => {
                                    if (onSliceLoadEnd) {
                                        onSliceLoadEnd();
                                    }
                                }
                            );
                        },
                        () => {
                            if (onSliceLoadEnd) {
                                onSliceLoadEnd();
                            }
                        }
                    );
                }
            });
        }, 0);

        return slices;
    }

    getTileExtentForKey(key: VolumeTileKey, normalized?: boolean) {
        const tileGrid = this.config_.tileGrid;
        const tileSize = this.getTileSizeForLevel_(key.level);

        const minX = tileGrid.extent.minX + key.x * tileSize.sizeX;
        const minY = tileGrid.extent.minY + key.y * tileSize.sizeY;
        const minZ = tileGrid.extent.minZ + key.z * tileSize.sizeZ;

        const tileExtent = {
            minX: minX,
            minY: minY,
            minZ: minZ,
            maxX: minX + tileSize.sizeX,
            maxY: minY + tileSize.sizeY,
            maxZ: minZ + tileSize.sizeZ
        };

        if (normalized) {
            const size = {
                x: tileGrid.extent.maxX - tileGrid.extent.minX,
                y: tileGrid.extent.maxY - tileGrid.extent.minY,
                z: tileGrid.extent.maxZ - tileGrid.extent.minZ
            };
            tileExtent.minX = (tileExtent.minX - tileGrid.extent.minX) / size.x;
            tileExtent.maxX = (tileExtent.maxX - tileGrid.extent.minX) / size.x;
            tileExtent.minY = (tileExtent.minY - tileGrid.extent.minY) / size.y;
            tileExtent.maxY = (tileExtent.maxY - tileGrid.extent.minY) / size.y;
            tileExtent.minZ = (tileExtent.minZ - tileGrid.extent.minZ) / size.z;
            tileExtent.maxZ = (tileExtent.maxZ - tileGrid.extent.minZ) / size.z;
        }

        return tileExtent;
    }

    private getTileSizeForLevel_(level: number) {
        const tileGrid = this.config_.tileGrid;

        const levelFactor = Math.pow(2, level);
        const sizeFactor = tileGrid.numRootTiles.map((numTiles) => levelFactor * numTiles);

        return {
            sizeX: (tileGrid.extent.maxX - tileGrid.extent.minX) / sizeFactor[0],
            sizeY: (tileGrid.extent.maxY - tileGrid.extent.minY) / sizeFactor[1],
            sizeZ: (tileGrid.extent.maxZ - tileGrid.extent.minZ) / sizeFactor[2]
        };
    }
}
