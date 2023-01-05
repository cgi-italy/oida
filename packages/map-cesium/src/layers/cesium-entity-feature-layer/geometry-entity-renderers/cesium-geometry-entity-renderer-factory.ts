import { Entity } from 'cesium';

import { IFeatureStyle, Geometry, createDynamicFactory } from '@oidajs/core';

export interface CesiumGeometryEntityRenderer<G extends Geometry = Geometry> {
    create: (id: string, geometry: G, style: IFeatureStyle, layerOptions) => Entity | undefined;
    updateGeometry: (entity: Entity, geometry: G) => void;
    updateStyle: (entity: Entity, style: IFeatureStyle) => void;
}

export const geometryEntityRendererFactory = createDynamicFactory<CesiumGeometryEntityRenderer<any>>('cesiumGeometryEntityRenderers');
