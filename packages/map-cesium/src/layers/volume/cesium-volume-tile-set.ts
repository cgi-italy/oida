import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Texture from 'cesium/Source/Renderer/Texture';

import destroyObject from 'cesium/Source/Core/destroyObject';

import { VolumeSourceConfig, VolumeTileKey } from '@oida/core';

import { CesiumVolumeSource } from './cesium-volume-source';
import { CesiumVolumeTile } from './cesium-volume-tile';
import { CesiumVolumeTilePrimitive } from './cesium-volume-tile-primitive';
import { CesiumVolumeView } from './volume-view';
import { CesiumVolumeTileTexture } from './cesium-volume-tile-texture';

export type CesiumColorMapConfig = {
    range: Cartesian2;
    clamp: boolean;
    noDataValue: number;
    colorMap: HTMLImageElement | HTMLCanvasElement
};

export type CesiumVolumeTileSetConfig = {
    source?: CesiumVolumeSource;
    volumeView?: CesiumVolumeView;
    colorMap?: CesiumColorMapConfig;
    verticalScale?: number
};

export class CesiumVolumeTileSet {

    protected static colormapShaders_ = CesiumVolumeTileSet.createColorMappingShaders_();

    protected static createColorMappingShaders_() {

        const colorMappingSource = `
            uniform vec2 mapRange;
            uniform bool clampRange;
            uniform float noDataValue;
            uniform sampler2D colorMapTexture;

            vec4 applyColorMap(float value) {
                if (value == noDataValue) {
                    return vec4(0.0, 0.0, 0.0, 0.0);
                }
                if (!clampRange && (value < mapRange[0] || value > mapRange[1])) {
                    return vec4(0.0, 0.0, 0.0, 0.0);
                }

                float normalizedValue = (value - mapRange[0]) / (mapRange[1] - mapRange[0]);
                return texture2D(colorMapTexture, vec2(normalizedValue, 0.5));
            }
        `;

        return [colorMappingSource];
    }

    protected source_: CesiumVolumeSource | undefined;
    protected sourceRevision_: number;
    protected volumeView_: CesiumVolumeView | undefined;
    protected verticalScale_: number;

    protected colorMap_: (CesiumColorMapConfig & {
        texture: Texture | undefined,
        needsUpdate: boolean
    }) | undefined;

    protected rootTiles_: CesiumVolumeTile[];

    constructor(config: CesiumVolumeTileSetConfig) {
        this.source_ = config.source;
        this.sourceRevision_ = 0;

        if (config.colorMap) {
            this.colorMap_ = {
                texture: undefined,
                needsUpdate: true,
                ...config.colorMap
            };
        }

        this.verticalScale_ = config.verticalScale || 1;

        this.rootTiles_ = this.createRootTiles_();
    }

    setSource(source: CesiumVolumeSource | undefined) {
        this.rootTiles_.forEach((tile) => tile.destroy());
        this.source_ = source;
        this.sourceRevision_++;
        this.rootTiles_ = this.createRootTiles_();
    }

    getSource() {
        return this.source_;
    }

    setVerticalScale(verticalScale) {
        this.verticalScale_ = verticalScale;
        if (this.volumeView_) {
            this.volumeView_.forceUpdate();
        }
    }

    getVerticalScale() {
        return this.verticalScale_;
    }

    setVolumeView(volumeView: CesiumVolumeView | undefined) {
        this.volumeView_ = volumeView;
    }

    updateColorMap(colorMapConfig: Partial<CesiumColorMapConfig>) {
        if (this.colorMap_) {
            if (colorMapConfig.colorMap !== undefined) {
                this.colorMap_.colorMap = colorMapConfig.colorMap;
                this.colorMap_.needsUpdate = true;
            }
            if (colorMapConfig.range !== undefined) {
                this.colorMap_.range = colorMapConfig.range;
            }
            if (colorMapConfig.clamp !== undefined) {
                this.colorMap_.clamp = colorMapConfig.clamp;
            }
            if (colorMapConfig.noDataValue !== undefined) {
                this.colorMap_.noDataValue = colorMapConfig.noDataValue;
            }

        } else {
            this.colorMap_ = {
                texture: undefined,
                needsUpdate: true,
                range: {
                    min: 0,
                    max: 100
                },
                clamp: true,
                noDataValue: 0,
                colorMap: new Image(),
                ...colorMapConfig
            };
        }
    }

    hasColorMap() {
        return !!this.colorMap_;
    }

    getColorMapShaderSources() {
        return this.colorMap_ ? CesiumVolumeTileSet.colormapShaders_ : [];
    }

    getColorMapUniforms() {

        const colorMapConfig = this.colorMap_;

        return colorMapConfig ? {
            colorMapTexture: () => colorMapConfig.texture,
            mapRange: () => colorMapConfig.range,
            noDataValue: () => colorMapConfig.noDataValue,
            clampRange: () => colorMapConfig.clamp
        } : {};
    }

    update(frameState) {
        if (this.colorMap_ && this.colorMap_.needsUpdate) {
            if (!this.colorMap_.texture) {
                this.colorMap_.texture = this.createColorMapTexture_(this.colorMap_.colorMap, frameState.context);
            } else {
                this.colorMap_.texture.copyFrom(this.colorMap_.colorMap);
            }
            this.colorMap_.needsUpdate = false;
        }
        this.rootTiles_.forEach(tile => tile.traverse(frameState));
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }

    getTileExtentForKey(key: VolumeTileKey, normalized?: boolean) {

        if (!this.source_) {
            throw new Error('getTileExtentForKey called without a valid source');
        }

        return this.source_.getTileExtentForKey(key, normalized);
    }

    createTile(tileKey: VolumeTileKey, parent?: CesiumVolumeTile) {
        return new CesiumVolumeTile({
            tileKey: tileKey,
            tileSet: this,
            parent: parent
        });
    }

    updateTileForRendering(tile: CesiumVolumeTile) {
        if (tile.getTextureRevision() < this.sourceRevision_) {

            let tileTexture : CesiumVolumeTileTexture | undefined;
            if (this.source_) {
                tileTexture = new CesiumVolumeTileTexture({
                    source: this.source_,
                    tileKey: tile.getTileKey()
                });
            }

            tile.setTexture(tileTexture, this.sourceRevision_);

        }

        if (this.volumeView_) {
            this.volumeView_.updateTileForRendering(tile);
        }

    }


    protected createRootTiles_() {

        if (!this.source_) {
            return [];
        }

        let tileGrid = this.source_.getTileGrid();

        let rootTiles: CesiumVolumeTile[] = [];
        for (let x = 0; x < tileGrid.numRootTiles[0]; ++x) {
            for (let y = 0; y < tileGrid.numRootTiles[1]; ++y) {
                for (let z = 0; z < (tileGrid.numRootTiles[2] || 1); ++z) {
                    rootTiles.push(
                        this.createTile({
                            level: 0,
                            x: x,
                            y: y,
                            z: z
                        })
                    );
                }
            }
        }

        return rootTiles;
    }

    protected createColorMapTexture_(colorMap: HTMLImageElement | HTMLCanvasElement, context) {
        return new Texture({
            source: colorMap,
            context: context
        });
    }

}

