import { Geometry, GeometryCollection } from '../../common';
import { IMapLayerRenderer, MapLayerRendererConfig } from './map-layer-renderer';

interface IGeometryStyle {
    visible: boolean;
    zIndex?: number;
    pickingDisabled?: boolean;
}

export type Color = [number, number, number, number?];

export interface ICircleStyle extends IGeometryStyle {
    radius?: number;
    fillColor?: Color;
    strokeColor?: Color;
}

export interface IIconStyle extends IGeometryStyle {
    url: string;
    scale?: number;
    color?: Color;
    rotation?: number;
}

export type IPointStyle = ICircleStyle | IIconStyle;

export const isIcon = (style: IPointStyle): style is IIconStyle => {
    return (style as IIconStyle).url !== undefined;
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

export interface ILabelStyle extends IGeometryStyle {
    fillColor?: Color;
    strokeColor?: Color;
    strokeWidth?: number;
    text: string;
    font?: string;
    offsetX?: number;
    offsetY?: number;
    scale?: number;
}

export interface IFeatureStyle {
    point?: IPointStyle;
    line?: ILineStyle;
    polygon?: IPolygonStyle;
    label?: ILabelStyle;
}

export type FeatureGeometry = Exclude<Geometry, GeoJSON.GeometryCollection | GeometryCollection>;

export type IFeature<T = any> = {
    id: string;
    data: T;
};

export type FeatureClusteringConfig<T = any> = {
    enabled: boolean;
    style: (clusterFeatures: { model: T }[]) => {
        label: ILabelStyle;
        point: IPointStyle;
    };
    distance?: number;
};

export type FeatureLayerRendererConfig<T = any> = MapLayerRendererConfig & {
    onFeatureHover?: (feature: IFeature<T>, coordinate: GeoJSON.Position) => void;
    onFeatureSelect?: (feature: IFeature<T>, coordinate: GeoJSON.Position) => void;
    clustering?: FeatureClusteringConfig;
};

export interface IFeatureLayerRenderer<T = any> extends IMapLayerRenderer {
    addFeature(id: string, geometry: FeatureGeometry, style: IFeatureStyle, data?: T): IFeature<T> | undefined;
    hasFeature(id: string): boolean;
    getFeatureData(id: string): T | undefined;
    updateFeatureGeometry(id: string, geometry: FeatureGeometry);
    updateFeatureStyle(id: string, style: IFeatureStyle);
    removeFeature(id: string);
    removeAllFeatures();
}

export const FEATURE_LAYER_ID = 'feature';

declare module './map-layer-renderer' {
    export interface IMapLayerRendererConfigDefinitions {
        [FEATURE_LAYER_ID]: FeatureLayerRendererConfig;
    }
}
