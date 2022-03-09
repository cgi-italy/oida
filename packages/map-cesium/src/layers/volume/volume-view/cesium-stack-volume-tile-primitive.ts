import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import GeometryAttribute from 'cesium/Source/Core/GeometryAttribute';
import Geometry from 'cesium/Source/Core/Geometry';
import GeometryPipeline from 'cesium/Source/Core/GeometryPipeline';
import ComponentDatatype from 'cesium/Source/Core/ComponentDatatype';
import PrimitiveType from 'cesium/Source/Core/PrimitiveType';
import BoundingSphere from 'cesium/Source/Core/BoundingSphere';

import { CesiumVolumeTilePrimitive, CesiumVolumeTilePrimitiveConfig } from '../cesium-volume-tile-primitive';

export type CesiumStackVolumeTilePrimitiveConfig = {
    numSlices: number;
} & CesiumVolumeTilePrimitiveConfig;

export class CesiumStackVolumeTilePrimitive extends CesiumVolumeTilePrimitive {
    protected numSlices_: number;

    constructor(config: CesiumStackVolumeTilePrimitiveConfig) {
        super(config);
        this.numSlices_ = config.numSlices;
    }

    protected createGeometry_() {
        const extent = this.tileSet_.getTileExtentForKey(this.tileKey_);

        const numSlices = this.numSlices_;
        const positions = new Float32Array(numSlices * 12);
        const str = new Float32Array(numSlices * 12);
        const indices = new Uint16Array(numSlices * 6);

        let sliceZ = extent.minZ;
        const zStep = (extent.maxZ - extent.minZ) / numSlices;
        for (let i = 0; i < numSlices; ++i) {
            const sliceCoords = this.createSliceCoordinates_(sliceZ, extent, i);
            positions.set(sliceCoords.positions, i * 12);
            str.set(sliceCoords.str, i * 12);
            indices.set(sliceCoords.indices, i * 6);

            sliceZ += zStep;
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

    protected createSliceCoordinates_(z, extent, sliceIdx) {
        const reproject = this.getCoordReprojectionFunction_();

        const cartesianPositions = Cartesian3.fromDegreesArrayHeights([
            ...reproject([extent.minX, extent.minY, z]),
            ...reproject([extent.minX, extent.maxY, z]),
            ...reproject([extent.maxX, extent.maxY, z]),
            ...reproject([extent.maxX, extent.minY, z])
        ]);

        const positions = Cartesian3.packArray(cartesianPositions, new Float32Array(cartesianPositions.length * 3));

        const normZ = (z - extent.minZ) / (extent.maxZ - extent.minZ);

        const str = new Float32Array([0, 0, normZ, 0, 1, normZ, 1, 1, normZ, 1, 0, normZ]);

        const indexOffset = sliceIdx * 4;

        const indices = new Uint16Array([
            indexOffset + 0,
            indexOffset + 1,
            indexOffset + 2,
            indexOffset + 0,
            indexOffset + 2,
            indexOffset + 3
        ]);

        return {
            positions,
            str,
            indices
        };
    }
}
