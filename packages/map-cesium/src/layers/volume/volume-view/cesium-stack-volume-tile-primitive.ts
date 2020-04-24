import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import GeometryAttribute from 'cesium/Source/Core/GeometryAttribute';
import Geometry from 'cesium/Source/Core/Geometry';
import GeometryPipeline from 'cesium/Source/Core/GeometryPipeline';
import ComponentDatatype from 'cesium/Source/Core/ComponentDatatype';
import PrimitiveType from 'cesium/Source/Core/PrimitiveType';
import BoundingSphere from 'cesium/Source/Core/BoundingSphere';

import { CesiumVolumeTilePrimitive, CesiumVolumeTilePrimitiveConfig } from '../cesium-volume-tile-primitive';

export type CesiumStackVolumeTilePrimitiveConfig = {
    numSlices: number
} & CesiumVolumeTilePrimitiveConfig;


export class CesiumStackVolumeTilePrimitive extends CesiumVolumeTilePrimitive {

    protected numSlices_: number;

    constructor(config: CesiumStackVolumeTilePrimitiveConfig) {
        super(config);
        this.numSlices_ = config.numSlices;
    }

    protected createGeometry_() {
        let extent = this.tileSet_.getTileExtentForKey(this.tileKey_);

        let numSlices = this.numSlices_;
        let positions = new Float32Array(numSlices * 12);
        let str = new Float32Array(numSlices * 12);
        let indices = new Uint16Array(numSlices * 6);

        let sliceZ = extent.minZ;
        let zStep = (extent.maxZ - extent.minZ) / numSlices;
        for (let i = 0; i < numSlices; ++i) {
            let sliceCoords = this.createSliceCoordinates_(sliceZ, extent, i);
            positions.set(sliceCoords.positions, i * 12);
            str.set(sliceCoords.str, i * 12);
            indices.set(sliceCoords.indices, i * 6);

            sliceZ += zStep;
        }

        let geometry = new Geometry({
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

        let reproject = this.getCoordReprojectionFunction_();

        let cartesianPositions = Cartesian3.fromDegreesArrayHeights([
            ...reproject([extent.minX, extent.minY, z]),
            ...reproject([extent.minX, extent.maxY, z]),
            ...reproject([extent.maxX, extent.maxY, z]),
            ...reproject([extent.maxX, extent.minY, z])
        ]);

        let positions = Cartesian3.packArray(cartesianPositions, new Float32Array(cartesianPositions.length * 3));

        let normZ = (z - extent.minZ) / (extent.maxZ - extent.minZ);

        let str = new Float32Array([
            0, 0, normZ,
            0, 1, normZ,
            1, 1, normZ,
            1, 0, normZ
        ]);

        let indexOffset = sliceIdx * 4;

        let indices = new Uint16Array([
            indexOffset + 0, indexOffset + 1, indexOffset + 2,
            indexOffset + 0, indexOffset + 2, indexOffset + 3
        ]);

        return {
            positions,
            str,
            indices
        };
    }
}
