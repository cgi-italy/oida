import { IPointStyle, ILineStyle, IPolygonStyle, FeatureGeometry } from '@oidajs/core';

export type GeometryStyle = IPointStyle | ILineStyle | IPolygonStyle;

export interface CesiumGeometryPrimitiveFeature<
    RP extends Record<string, any> = Record<string, any>,
    S extends GeometryStyle = GeometryStyle
> {
    id: string;
    style: S;
    geometryRenderer: CesiumGeometryPrimitiveRenderer;
    geometryType: FeatureGeometry['type'];
    data: any;
    renderProps: RP;
}

export interface CesiumGeometryPrimitiveRenderer<F extends CesiumGeometryPrimitiveFeature = CesiumGeometryPrimitiveFeature> {
    getPrimitives(): any[];
    addFeature(id: string, geometry: FeatureGeometry, style: F['style'], data: any): F;
    updateGeometry(feature: F, geometry: FeatureGeometry): void;
    updateStyle(feature: F, style: F['style']): void;
    removeFeature(feature: F): void;
    clear(): void;
    destroy(): void;
}
