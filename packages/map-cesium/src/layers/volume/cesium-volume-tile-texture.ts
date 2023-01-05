import { Cartesian2, Texture, PixelDatatype, PixelFormat } from 'cesium';

import { VolumeTileKey } from '@oidajs/core';

import { CesiumVolumeSource, CesiumVolumeSlice } from './cesium-volume-source';

export type CesiumVolumeTileTextureConfig = {
    source: CesiumVolumeSource;
    tileKey: VolumeTileKey;
};

export class CesiumVolumeTileTexture {
    static getSamplingShaderSources() {
        return CesiumVolumeTileTexture.samplingShaders_;
    }

    protected static samplingShaders_ = CesiumVolumeTileTexture.createSamplingShader_();

    protected static createSamplingShader_() {
        const dataSamplerSource = `
            uniform vec2 sliceGrid;
            uniform sampler2D volumeTexture;

            //Acts like a texture3D using Z slices and trilinear filtering.
            vec4 sampleAs3DTexture(vec3 texCoord) {
                float Z = texCoord.z * (sliceGrid.x * sliceGrid.y - 1.0);
                int slice = int(Z); //Index of first slice

                //X & Y coords of sample scaled to slice size
                vec2 sampleOffset = texCoord.xy / sliceGrid;
                //Offsets in 2D texture of given slice indices
                //(add offsets to scaled position within slice to get sample positions)
                float A = float(slice) / sliceGrid.x;
                float B = min(float(slice + 1), sliceGrid.x * sliceGrid.y - 1.0) / sliceGrid.x;
                vec2 z1offset = vec2(fract(A), floor(A) / sliceGrid.y) + sampleOffset;
                vec2 z2offset = vec2(fract(B), floor(B) / sliceGrid.y) + sampleOffset;

                //Interpolate the final value by position between slices [0,1]
                return mix(texture2D(volumeTexture, z1offset), texture2D(volumeTexture, z2offset), fract(Z));
            }
        `;

        return [dataSamplerSource];
    }

    protected config_: CesiumVolumeTileTextureConfig;
    protected texture_: Texture;
    protected sliceGridSize_: Cartesian2 | undefined;

    constructor(config: CesiumVolumeTileTextureConfig) {
        this.config_ = config;
    }

    load(context) {
        return new Promise<void>((resolve) => {
            const slices = this.config_.source.loadTileData(this.config_.tileKey, (slice) => {
                this.updateTextureSlice_(slice, context);
                resolve();
            });

            this.computeSliceGridSize_(slices.length);
        });
    }

    isReady() {
        return !!this.texture_;
    }

    destroy() {
        return;
    }

    getSamplingUniforms() {
        return {
            volumeTexture: () => this.texture_,
            sliceGrid: () => this.sliceGridSize_
        };
    }

    protected updateTextureSlice_(slice: CesiumVolumeSlice, context) {
        if (!this.texture_) {
            this.initTexture_(slice, context);
        }

        const gridOffset = this.getTextureOffset_(slice.z);

        if (ArrayBuffer.isView(slice.data)) {
            const tileGrid = this.config_.source.getTileGrid();
            const [tileWidth, tileHeight] = tileGrid.tileSize;
            this.texture_.copyFrom({
                source: {
                    width: tileWidth,
                    height: tileHeight,
                    arrayBufferView: slice.data
                },
                xOffset: gridOffset.x,
                yOffset: gridOffset.y
            });
        } else {
            this.texture_.copyFrom({
                source: slice.data,
                xOffset: gridOffset.x,
                yOffset: gridOffset.y
            });
        }
    }

    protected initTexture_(slice: CesiumVolumeSlice, context) {
        const tileGrid = this.config_.source.getTileGrid();
        const [tileWidth, tileHeight] = tileGrid.tileSize;

        let pixelFormat, pixelDataType;
        if (slice.data instanceof HTMLImageElement || slice.data instanceof HTMLCanvasElement) {
            pixelFormat = PixelFormat.RGBA;
            pixelDataType = PixelDatatype.UNSIGNED_BYTE;
        } else {
            pixelFormat = PixelFormat.LUMINANCE;
            if (slice.data instanceof Float32Array || slice.data instanceof Float64Array) {
                pixelDataType = PixelDatatype.FLOAT;
            } else if (slice.data instanceof Uint8Array) {
                pixelDataType = PixelDatatype.UNSIGNED_BYTE;
            }
        }

        this.texture_ = new Texture({
            context: context,
            width: tileWidth * this.sliceGridSize_!.x,
            height: tileHeight * this.sliceGridSize_!.y,
            pixelFormat: pixelFormat,
            pixelDatatype: pixelDataType
        });
    }

    protected computeSliceGridSize_(numSlices: number) {
        const gridSize = Math.sqrt(numSlices);
        this.sliceGridSize_ = new Cartesian2(Math.floor(gridSize), Math.ceil(gridSize));
    }

    protected getTextureOffset_(z: number) {
        const tileGrid = this.config_.source.getTileGrid();

        const tileExtent = this.config_.source.getTileExtentForKey(this.config_.tileKey);
        const sizeZ = tileExtent.maxZ - tileExtent.minZ;
        const normZ = (z - tileExtent.minZ) / sizeZ;
        const gridIdx = Math.floor(normZ * this.sliceGridSize_!.x * this.sliceGridSize_!.y);

        const gridX = Math.floor(gridIdx % this.sliceGridSize_!.x);
        const gridY = Math.floor(gridIdx / this.sliceGridSize_!.x);

        return {
            x: gridX * tileGrid.tileSize[0],
            y: gridY * tileGrid.tileSize[1]
        };
    }
}
