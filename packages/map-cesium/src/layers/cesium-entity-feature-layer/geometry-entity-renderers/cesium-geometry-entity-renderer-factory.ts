import { IFeatureStyle, Geometry, createDynamicFactory } from '@oida/core';

export type CesiumEntity = any;

export interface CesiumGeometryEntityRenderer<G extends Geometry = Geometry> {
    create: (id: string, geometry: G, style: IFeatureStyle, layerOptions) => CesiumEntity | undefined;
    updateGeometry: (entity: CesiumEntity, geometry: G) => void;
    updateStyle: (entity: CesiumEntity, style: IFeatureStyle) => void;
}

export const geometryEntityRendererFactory = createDynamicFactory<CesiumGeometryEntityRenderer<any>>('cesiumGeometryEntityRenderers');
