import destroyObject from 'cesium/Source/Core/destroyObject';
import Geometry from 'cesium/Source/Core/Geometry';
import Matrix4 from 'cesium/Source/Core/Matrix4';
import GeometryPipeline from 'cesium/Source/Core/GeometryPipeline';
import VertexArray from 'cesium/Source/Renderer/VertexArray';
import DrawCommand from 'cesium/Source/Renderer/DrawCommand';
import ShaderProgram from 'cesium/Source/Renderer/ShaderProgram';
import ShaderSource from 'cesium/Source/Renderer/ShaderSource';
import BufferUsage from 'cesium/Source/Renderer/BufferUsage';
import Appearance from 'cesium/Source/Scene/Appearance';
import RenderState from 'cesium/Source/Renderer/RenderState';
import Pass from 'cesium/Source/Renderer/Pass';

import proj4 from 'proj4';

import { VolumeTileKey } from '@oidajs/core';

import { CesiumVolumeTileTexture } from './cesium-volume-tile-texture';
import { CesiumVolumeTileSet } from './cesium-volume-tile-set';


export type CesiumVolumeTilePrimitiveConfig = {
    tileSet: CesiumVolumeTileSet;
    tileKey: VolumeTileKey;
};

export abstract class CesiumVolumeTilePrimitive {

    static defaultShaderSource_ = CesiumVolumeTilePrimitive.createDefaultVertexShaderSource_();

    static createDefaultVertexShaderSource_() {
        let vertexShaderSource = `
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec3 str;

            varying vec3 v_positionEC;
            varying vec3 v_normalEC;
            varying vec3 v_str;

            void main() {
                v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;       // position in eye coordinates
                v_normalEC = czm_normal * normal;                               // normal in eye coordinates
                v_str = str;
                gl_Position = czm_modelViewProjection * vec4(position, 1.0);
            }
        `;

        let fragmentShaderSource = `
            varying vec3 v_positionEC;
            varying vec3 v_normalEC;
            varying vec3 v_str;

            void main() {
                #ifdef DISABLE_TEXTURE_SAMPLING
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                #else
                    vec4 value = sampleAs3DTexture(v_str);
                    #ifdef COLORMAP_ENABLED
                        gl_FragColor = applyColorMap(value.x);
                    #else
                        gl_FragColor = value;
                    #endif
                #endif
            }
        `;

        return {
            vertex: vertexShaderSource,
            fragment: fragmentShaderSource
        };
    }

    protected drawCommand_: DrawCommand | undefined;
    protected texture_: CesiumVolumeTileTexture | undefined;
    protected tileSet_: CesiumVolumeTileSet;
    protected tileKey_: VolumeTileKey;
    protected textureUpdated_ = false;

    constructor(config: CesiumVolumeTilePrimitiveConfig) {
        this.tileSet_ = config.tileSet;
        this.tileKey_ = config.tileKey;
    }

    update(frameState) {

        //TODO: use a Primitive with _createCommandsFunction option instead
        if (!this.drawCommand_) {
            this.drawCommand_ = this.createDrawCommand_(frameState.context);
        } else if (this.textureUpdated_) {
            this.drawCommand_.shaderProgram = this.createShaderProgram_(
                frameState.context,
                this.drawCommand_.shaderProgram._attributeLocations
            );
            this.drawCommand_.uniformMap = this.getUniformMap_();
            this.textureUpdated_ = false;
        }
        if (this.drawCommand_ && this.drawCommand_.vertexArray) {
            frameState.commandList.push(this.drawCommand_);
        }
    }

    setTexture(texture: CesiumVolumeTileTexture | undefined) {
        this.texture_ = texture;
        this.textureUpdated_ = true;
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        this.drawCommand_.shaderProgram = this.drawCommand_.shaderProgram && this.drawCommand_.shaderProgram.destroy();
        return destroyObject(this);
    }

    protected getCoordReprojectionFunction_() {

        const minZ = this.tileSet_.getSource()?.getTileGrid().extent.minZ;
        let srs = this.tileSet_.getSource()?.getTileGrid().srs;
        let verticalScale = this.tileSet_.getVerticalScale();
        if (srs !== 'EPSG:4326') {
            return (coord) => {
                let outputCoord = proj4(srs, 'EPSG:4326', [coord[0], coord[1]]);

                if (minZ && minZ < 0) {
                    outputCoord[2] = coord[2] - minZ;
                } else {
                    outputCoord[2] = coord[2];
                }
                outputCoord[2] *= verticalScale;
                return outputCoord;
            };
        } else {
            return (coord) => {
                return [coord[0], coord[1], coord[2] * verticalScale];
            };
        }
    }

    protected createDrawCommand_(context) {

        let {vertexArray, attributeLocations, primitiveType, boundingSphere } = this.createVertexArray_(context);

        let shaderProgram = this.createShaderProgram_(context, attributeLocations);

        return new DrawCommand({
            vertexArray: vertexArray,
            primitiveType: primitiveType,
            renderState: RenderState.fromCache(this.getRenderState_()),
            shaderProgram: shaderProgram,
            uniformMap: this.getUniformMap_(),
            owner: this,
            pass: Pass.TRANSLUCENT,
            modelMatrix: Matrix4.IDENTITY,
            boundingVolume: boundingSphere
        });
    }

    protected createShaderProgram_(context, attributeLocations) {
        return ShaderProgram.fromCache({
            context: context,
            attributeLocations: attributeLocations,
            vertexShaderSource: this.createVertexShaderSource_(),
            fragmentShaderSource: this.createFragmentShaderSource_()
        });
    }

    protected createVertexArray_(context) {

        let geometry = this.createGeometry_(context);

        if (!geometry) {
            return {
                vertexArray: undefined,
                attributeLocations: undefined,
                primitiveType: undefined
            };
        }

        let attributeLocations = GeometryPipeline.createAttributeLocations(geometry);

        return {
            vertexArray: VertexArray.fromGeometry({
                context: context,
                geometry: geometry,
                attributeLocations: attributeLocations,
                bufferUsage: BufferUsage.STATIC_DRAW,
                interleave : false
            }),
            attributeLocations: attributeLocations,
            primitiveType: geometry.primitiveType,
            boundingSphere: geometry.boundingSphere
        };
    }

    protected createFragmentShaderSource_() {
        let defines: string[] = [];
        if (!this.texture_) {
            defines.push('DISABLE_TEXTURE_SAMPLING');
        } else {
            if (this.tileSet_.hasColorMap()) {
                defines.push('COLORMAP_ENABLED');
            }
        }

        return new ShaderSource({
            defines: defines,
            sources: this.getFragmentShaderSources_()
        });
    }

    protected createVertexShaderSource_() {
        return new ShaderSource({
            sources: this.getVertexShaderSources_()
        });
    }

    protected getRenderState_() {
        return Appearance.getDefaultRenderState(true, false);
    }

    protected getFragmentShaderSources_() {
        return [
            ...CesiumVolumeTileTexture.getSamplingShaderSources(),
            ...this.tileSet_.getColorMapShaderSources(),
            CesiumVolumeTilePrimitive.defaultShaderSource_.fragment
        ];
    }

    protected getVertexShaderSources_() {
        return [CesiumVolumeTilePrimitive.defaultShaderSource_.vertex];
    }

    protected getUniformMap_() {
        return {
            ...(this.texture_ ? this.texture_.getSamplingUniforms() : {}),
            ...this.tileSet_.getColorMapUniforms()
        };
    }

    protected abstract createGeometry_(context): Geometry;
}
