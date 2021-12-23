import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import GeometryAttribute from 'cesium/Source/Core/GeometryAttribute';
import Geometry from 'cesium/Source/Core/Geometry';
import GeometryPipeline from 'cesium/Source/Core/GeometryPipeline';
import ComponentDatatype from 'cesium/Source/Core/ComponentDatatype';
import PrimitiveType from 'cesium/Source/Core/PrimitiveType';
import BoundingSphere from 'cesium/Source/Core/BoundingSphere';

import { CesiumVolumeTilePrimitive, CesiumVolumeTilePrimitiveConfig } from '../cesium-volume-tile-primitive';

export type CesiumSliceVolumeTilePrimitiveConfig = {
    xSlice?: number;
    ySlice?: number;
    zSlice?: number;
} & CesiumVolumeTilePrimitiveConfig;

export class CesiumSliceVolumeTilePrimitive extends CesiumVolumeTilePrimitive {
    protected xSlice_: number | undefined;
    protected ySlice_: number | undefined;
    protected zSlice_: number | undefined;

    constructor(config: CesiumSliceVolumeTilePrimitiveConfig) {
        super(config);

        this.xSlice_ = config.xSlice;
        this.ySlice_ = config.ySlice;
        this.zSlice_ = config.zSlice;
    }

    protected createGeometry_() {
        const xSliceArrays = this.createXSlice_(this.xSlice_);
        const ySliceArrays = this.createYSlice_(this.ySlice_);
        const zSliceArrays = this.createZSlice_(this.zSlice_);

        let totalPositions = 0;
        let totalIndices = 0;
        if (xSliceArrays) {
            totalPositions += xSliceArrays.positions.length / 3;
            totalIndices += xSliceArrays.indices.length;
        }
        if (ySliceArrays) {
            if (totalPositions) {
                ySliceArrays.indices = ySliceArrays.indices.map((val) => val + totalPositions);
            }
            totalPositions += ySliceArrays.positions.length / 3;
            totalIndices += ySliceArrays.indices.length;
        }
        if (zSliceArrays) {
            if (totalPositions) {
                zSliceArrays.indices = zSliceArrays.indices.map((val) => val + totalPositions);
            }
            totalPositions += zSliceArrays.positions.length / 3;
            totalIndices += zSliceArrays.indices.length;
        }

        if (!totalPositions) {
            return undefined;
        }

        const positions = new Float32Array(totalPositions * 3);
        const str = new Float32Array(totalPositions * 3);
        const indices = new Uint16Array(totalIndices);

        let positionOffset = 0;
        let indexOffset = 0;
        if (xSliceArrays) {
            positions.set(xSliceArrays.positions, 0);
            str.set(xSliceArrays.str, 0);
            indices.set(xSliceArrays.indices, 0);
            positionOffset += xSliceArrays.positions.length;
            indexOffset += xSliceArrays.indices.length;
        }
        if (ySliceArrays) {
            positions.set(ySliceArrays.positions, positionOffset);
            str.set(ySliceArrays.str, positionOffset);
            indices.set(ySliceArrays.indices, indexOffset);
            positionOffset += ySliceArrays.positions.length;
            indexOffset += ySliceArrays.indices.length;
        }
        if (zSliceArrays) {
            positions.set(zSliceArrays.positions, positionOffset);
            str.set(zSliceArrays.str, positionOffset);
            indices.set(zSliceArrays.indices, indexOffset);
            positionOffset += zSliceArrays.positions.length;
            indexOffset += zSliceArrays.indices.length;
        }

        const geometry = new Geometry({
            attributes: {
                position: new GeometryAttribute({
                    componentDatatype: ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: positions
                }),
                str: new GeometryAttribute({
                    componentDatatype: ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: str
                })
            },
            indices: indices,
            primitiveType: PrimitiveType.TRIANGLES,
            boundingSphere: BoundingSphere.fromVertices(positions)
        });

        return GeometryPipeline.computeNormal(geometry);
    }

    protected createXSlice_(xSlice) {
        if (xSlice === undefined) {
            return;
        }

        const extent = this.tileSet_.getTileExtentForKey(this.tileKey_);

        const [absX, normX] = this.getSliceCoordinates_(xSlice, 'x', extent);
        if (absX === undefined || normX === undefined) {
            return;
        }

        const reproject = this.getCoordReprojectionFunction_();

        //TODO: grid instead of 4 corners
        // let numSteps = 16;
        // let y = extent.minY;
        // let sizeY = (extent.maxY - extent.minY);
        // let yStep = sizeY / numSteps;
        // for (let y = 0; y < numSteps; ++y) {
        //     reproject([absX, y, extent.minZ]);
        //     reproject([absX, y, extent.maxZ]);
        //     [normX, y / sizeY, 0];
        //     [normX, y / sizeY, 1]
        // }

        const cartesianPositions = Cartesian3.fromDegreesArrayHeights([
            ...reproject([absX, extent.minY, extent.minZ]),
            ...reproject([absX, extent.maxY, extent.minZ]),
            ...reproject([absX, extent.maxY, extent.maxZ]),
            ...reproject([absX, extent.minY, extent.maxZ])
        ]);

        const positions = Cartesian3.packArray(cartesianPositions, new Float32Array(cartesianPositions.length * 3));

        const str = new Float32Array([normX, 0, 0, normX, 1, 0, normX, 1, 1, normX, 0, 1]);

        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

        return {
            positions,
            str,
            indices
        };
    }

    protected createYSlice_(ySlice) {
        if (ySlice === undefined) {
            return;
        }

        const extent = this.tileSet_.getTileExtentForKey(this.tileKey_);

        const [absY, normY] = this.getSliceCoordinates_(ySlice, 'y', extent);
        if (absY === undefined || normY === undefined) {
            return;
        }

        const reproject = this.getCoordReprojectionFunction_();

        const cartesianPositions = Cartesian3.fromDegreesArrayHeights([
            ...reproject([extent.minX, absY, extent.minZ]),
            ...reproject([extent.maxX, absY, extent.minZ]),
            ...reproject([extent.maxX, absY, extent.maxZ]),
            ...reproject([extent.minX, absY, extent.maxZ])
        ]);

        const positions = Cartesian3.packArray(cartesianPositions, new Float32Array(cartesianPositions.length * 3));

        const str = new Float32Array([0, normY, 0, 1, normY, 0, 1, normY, 1, 0, normY, 1]);

        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

        return {
            positions,
            str,
            indices
        };
    }

    protected createZSlice_(zSlice) {
        if (zSlice === undefined) {
            return;
        }

        const extent = this.tileSet_.getTileExtentForKey(this.tileKey_);

        const [absZ, normZ] = this.getSliceCoordinates_(zSlice, 'z', extent);
        if (absZ === undefined || normZ === undefined) {
            return;
        }

        const reproject = this.getCoordReprojectionFunction_();

        const cartesianPositions = Cartesian3.fromDegreesArrayHeights([
            ...reproject([extent.minX, extent.minY, absZ]),
            ...reproject([extent.minX, extent.maxY, absZ]),
            ...reproject([extent.maxX, extent.maxY, absZ]),
            ...reproject([extent.maxX, extent.minY, absZ])
        ]);

        const positions = Cartesian3.packArray(cartesianPositions, new Float32Array(cartesianPositions.length * 3));

        const str = new Float32Array([0, 0, normZ, 0, 1, normZ, 1, 1, normZ, 1, 0, normZ]);

        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

        return {
            positions,
            str,
            indices
        };
    }

    protected getSliceCoordinates_(slice, axis, extent) {
        const normalizedExtent = this.tileSet_.getTileExtentForKey(this.tileKey_, true);

        let axisMinKey, axisMaxKey;

        if (axis === 'x') {
            axisMinKey = 'minX';
            axisMaxKey = 'maxX';
        } else if (axis === 'y') {
            axisMinKey = 'minY';
            axisMaxKey = 'maxY';
        } else if (axis === 'z') {
            axisMinKey = 'minZ';
            axisMaxKey = 'maxZ';
        }
        if (slice < normalizedExtent[axisMinKey] || slice > normalizedExtent[axisMaxKey]) {
            return [];
        }

        const normCoord = (slice - normalizedExtent[axisMinKey]) / (normalizedExtent[axisMaxKey] - normalizedExtent[axisMinKey]);
        const absCoord = extent[axisMinKey] + normCoord * (extent[axisMaxKey] - extent[axisMinKey]);

        return [absCoord, normCoord];
    }
}
