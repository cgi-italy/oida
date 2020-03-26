import { IPointStyle, ILineStyle, IPolygonStyle } from '@oida/core';

export type GeometryStyle = IPointStyle | ILineStyle | IPolygonStyle;

interface Feature {
    id: string;
    style: GeometryStyle;
}

export interface CesiumGeometryPrimitiveRenderer {
    getPrimitives();
    addFeature(id: string, geometry: GeoJSON.GeometryObject, style: GeometryStyle): Feature;
    updateGeometry(feature: Feature, geometry: GeoJSON.GeometryObject);
    updateStyle(feature: Feature, style: GeometryStyle);
    clear();
    destroy();
}
