import { ILayerRenderer } from './map-layer-renderer';

interface IGeometryStyle {
    visible: boolean;
}

declare type Color = [number, number, number, number?];

interface ICircleStyle extends IGeometryStyle {
    radius?: number;
    fillColor?: Color;
    strokeColor?: Color;
}

interface IIconStyle extends IGeometryStyle {
    url: string;
    scale?: number;
    color?: Color;
    rotation?: number;
}

export type IPointStyle = ICircleStyle | IIconStyle;

export const isIcon = (style: IPointStyle): style is IIconStyle => {
    return (<IIconStyle>style).url !== undefined;
};

export interface ILineStyle extends IGeometryStyle {
    color?: Color;
    width?: number;
}

export interface IPolygonStyle extends IGeometryStyle {
    fillColor?: Color;
    strokeColor?: Color;
    strokeWidth?: number;
}

export interface IFeatureStyle {
    point?: IPointStyle;
    line?: ILineStyle;
    polygon?: IPolygonStyle;
}

export interface IFeatureLayerRenderer extends ILayerRenderer {
    addFeature(id: string, geometry: GeoJSON.GeometryObject, style: IFeatureStyle);
    getFeature(id: string);
    updateFeatureGeometry(id: string, geometry: GeoJSON.GeometryObject);
    updateFeatureStyle(id: string, style: IFeatureStyle);
    removeFeature(id: string);
    removeAllFeatures();
}

export const FEATURE_LAYER_ID = 'feature';
