
import { GeoImageLayerSource, GeoImageLayerFootprint } from '@oidajs/core';

export type GLGeoImageProjectorConfig = {
    footprint: GeoImageLayerFootprint;
    source?: GeoImageLayerSource;
    gridSize?: number;
};

type GeoImageTextureData = {
    source: GeoImageLayerSource;
    size: number[];
    texture: WebGLTexture;
};

export class GLGeoImageProjector {

    protected static readonly shaders_ = {
        vertex: `
            attribute vec2 a_position;
            attribute vec3 a_texCoord;

            uniform vec2 u_resolution;

            varying vec3 v_texCoord;

            void main() {
                // convert the rectangle from pixels to 0.0 to 1.0
                vec2 zeroToOne = a_position / u_resolution;

                // convert from 0->1 to 0->2
                vec2 zeroToTwo = zeroToOne * 2.0;

                // convert from 0->2 to -1->+1 (clipspace)
                vec2 clipSpace = zeroToTwo - 1.0;

                gl_Position = vec4(clipSpace * vec2(1, 1), 0, 1);

                // pass the texCoord to the fragment shader
                // The GPU will interpolate this value between points.
                v_texCoord = a_texCoord;
            }
        `,
        fragment: `
            precision mediump float;

            // our texture
            uniform sampler2D u_image;

            // the texCoords passed in from the vertex shader.
            varying vec3 v_texCoord;

            void main() {
                gl_FragColor = texture2DProj(u_image, v_texCoord);
            }
        `
    };

    protected canvas_: HTMLCanvasElement;
    protected gl_: WebGLRenderingContext;
    protected program_: WebGLProgram;
    protected textureCoords_: WebGLBuffer;
    protected footprintBuffer_: WebGLBuffer;
    protected footprintIndexBuffer_: WebGLBuffer;
    protected data_: GeoImageTextureData | undefined;
    protected footprint_: GeoImageLayerFootprint;
    protected readonly gridSize_: number;

    constructor(config: GLGeoImageProjectorConfig) {

        this.gridSize_ = config.gridSize || 2;

        this.canvas_ = document.createElement('canvas');
        this.gl_ = this.createGLContent_();

        this.program_ = this.createGLProgram_(this.gl_, GLGeoImageProjector.shaders_.vertex, GLGeoImageProjector.shaders_.fragment);
        this.gl_.useProgram(this.program_);

        this.textureCoords_ = this.createTextureCoordBuffer_();
        this.footprintBuffer_ = this.createFootrpintBuffer_();
        this.footprintIndexBuffer_ = this.createFootrpintIndexBuffer_();

        this.footprint_ = config.footprint;
        this.data_ = config.source ? this.createTextureData_(config.source) : undefined;
    }

    setSource(source: GeoImageLayerSource | undefined) {
        this.data_ = source ? this.createTextureData_(source) : undefined;
    }

    setFootprint(footprint: GeoImageLayerFootprint) {
        this.footprint_ = footprint;
    }

    refreshSource() {
        if (!this.data_) {
            return;
        }
        const gl = this.gl_;
        gl.bindTexture(gl.TEXTURE_2D, this.data_.texture);

        // in principle texSubImage2D should be more efficient but in practice this is not the case
        // const newSize = this.getSourceSize_(this.data_.source);
        // if (newSize[0] !== this.data_.size[0] || newSize[1] !== this.data_.size[1]) {
        //     this.data_.size = newSize;
        //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.data_.source);
        // } else {
        //     gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.data_.source);
        // }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.data_.source);
    }

    getCanvas() {
        return this.canvas_;
    }

    render(extent: number[], imageSize: number[]) {
        const gl = this.gl_;

        this.canvas_.width = imageSize[0];
        this.canvas_.height = imageSize[1];

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const resolutionLocation = gl.getUniformLocation(this.program_, 'u_resolution');
        gl.uniform2f(resolutionLocation, imageSize[0], imageSize[1]);

        this.updateFootprintPositions_(extent, imageSize);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    protected updateFootprintPositions_(extent: number[], imageSize: number[]) {
        const gl = this.gl_;

        const extentSize = [
            extent[2] - extent[0],
            extent[3] - extent[1]
        ];

        const canvasPositions = this.footprint_.map((coord) => {
            return this.getCanvasPosition_(coord, extent, extentSize, imageSize);
        });

        // use projective texturing
        // https://help.agi.com/AGIComponents/html/BlogTrapezoidalTextureProjectionWithOpenGL.htm

        //get the intersection between the quadrilater diagonals
        const intersection = this.getDialogonalIntersection_(
            canvasPositions[0],
            canvasPositions[2],
            canvasPositions[1],
            canvasPositions[3],
        );

        //compute the ratios to get texture coordinates homogenous factor
        const d0 = this.getDistance_(canvasPositions[0], intersection);
        const d1 = this.getDistance_(canvasPositions[1], intersection);
        const d2 = this.getDistance_(canvasPositions[2], intersection);
        const d3 = this.getDistance_(canvasPositions[3], intersection);

        const q0 = (d0 + d2) / d2;
        const q1 = (d1 + d3) / d3;
        const q2 = (d2 + d0) / d0;
        const q3 = (d3 + d1) / d1;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoords_);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([
            0.0, q0, q0,
            q1, q1, q1,
            0.0, 0.0, q3,
            q2, 0.0, q2
        ]));

        gl.bindBuffer(gl.ARRAY_BUFFER, this.footprintBuffer_);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([
            canvasPositions[0][0], canvasPositions[0][1],
            canvasPositions[1][0], canvasPositions[1][1],
            canvasPositions[3][0], canvasPositions[3][1],
            canvasPositions[2][0], canvasPositions[2][1]
        ]));

    }

    protected createTextureData_(source: GeoImageLayerSource): GeoImageTextureData {
        const gl = this.gl_;

        const texture = gl.createTexture();
        if (!texture) {
            throw new Error('GLGeoImageProjector: unable to create source texture');
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

        const size = this.getSourceSize_(source);
        return {
            texture: texture,
            size: size,
            source: source
        };
    }

    protected getCanvasPosition_(coord: number[], extent: number[], extentSize: number[], imageSize: number[]) {
        return [
            (coord[0] - extent[0]) / extentSize[0] * imageSize[0],
            (coord[1] - extent[1]) / extentSize[1] * imageSize[1]
        ];
    }

    protected getSourceSize_(source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
        if (source instanceof HTMLVideoElement) {
            return [source.videoWidth, source.videoHeight];
        } else if (source instanceof HTMLImageElement) {
            return [source.naturalWidth, source.naturalHeight];
        } else {
            return [source.width, source.height];
        }
    }

    protected createFootrpintBuffer_() {
        const gl = this.gl_;

        const positionBuffer = gl.createBuffer();

        if (!positionBuffer) {
            throw new Error('GLGeoImageProjector: Unable to create positions buffer');
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                0, 0,
                0, 0,
                0, 0,
                0, 0
            ]),
            gl.DYNAMIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(this.program_, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        return positionBuffer;
    }

    protected createFootrpintIndexBuffer_() {
        const gl = this.gl_;

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

        if (!indexBuffer) {
            throw new Error('GLGeoImageProjector: Unable to create index buffer');
        }

        const indices = [
            0, 1, 2,
            2, 1, 3,
          ];
          gl.bufferData(
              gl.ELEMENT_ARRAY_BUFFER,
              new Uint16Array(indices),
              gl.STATIC_DRAW
          );

        return indexBuffer;
    }

    protected createTextureCoordBuffer_() {
        const gl = this.gl_;

        const texCoordLocation = gl.getAttribLocation(this.program_, 'a_texCoord');

        const texCoordBuffer = gl.createBuffer();
        if (!texCoordBuffer) {
            throw new Error('GLGeoImageProjector: Unable to create textcoord buffer');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            0.0, 0.0, 1.0,
            1.0, 0.0, 1.0
        ]), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 3, gl.FLOAT, false, 0, 0);

        return texCoordBuffer;
    }

    protected createGLContent_() {
        const names = ['webgl', 'experimental-webgl'];
        let context: WebGLRenderingContext | null = null;
        for (let ii = 0; ii < names.length; ++ii) {
            try {
                context = this.canvas_.getContext(names[ii]) as WebGLRenderingContext | null;
            } catch (e) {
            }
            if (context) {
                break;
            }
        }
        if (!context) {
            throw new Error('GLGeoImageProjector: unable to create webgl rendering context');
        }
        return context;
    }

    protected createGLProgram_(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) {
            throw new Error('GLGeoImageProjector: unable to create shaders');
        }

        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(`GLGeoImageProjector: ${gl.getShaderInfoLog(vertexShader)}`);
        }

        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(`GLGeoImageProjector: ${gl.getShaderInfoLog(fragmentShader)}`);
        }

        const program = gl.createProgram();
        if (!program) {
            throw new Error('GLGeoImageProjector: unable to create program');
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        return program;
    }

    protected getDialogonalIntersection_(p1: number[], p2: number[], p3: number[], p4: number[]) {
        const t = ((p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0]))
            / ((p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]));

        return [
            p1[0] + t * (p2[0] - p1[0]),
            p1[1] + t * (p2[1] - p1[1])
        ];
    }

    protected getDistance_(p1: number[], p2: number[]) {
        return Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) + (p2[1] - p1[1]));
    }
}

