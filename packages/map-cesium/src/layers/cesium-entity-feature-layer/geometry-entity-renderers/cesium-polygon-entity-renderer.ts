import { Cartesian3, Color, ArcType, Entity, PolygonHierarchy, PolygonGraphics, HeightReference } from 'cesium';

import { IFeatureStyle } from '@oidajs/core';

import { CesiumGeometryEntityRenderer } from './cesium-geometry-entity-renderer-factory';

const FEATURE_STYLE_KEY = 'featureStyle';
const LAYER_OPTIONS_KEY = 'layerOptions';

const getPolygonHierarchy = (coordinates) => {
    const outer = coordinates[0];
    const holes: any[] = [];
    for (let i = 1; i < coordinates.length; ++i) {
        if (coordinates[i].length > 2) {
            holes.push(new PolygonHierarchy(Cartesian3.fromDegreesArray(([] as any[]).concat(...coordinates[i]))));
        }
    }

    return new PolygonHierarchy(Cartesian3.fromDegreesArray(([] as any).concat(...outer)), holes);
};

export const createPolygonEntity = (id: string, geometry: GeoJSON.Polygon, featureStyle: IFeatureStyle, layerOptions?) => {
    const style = featureStyle.polygon;
    if (!style) {
        return;
    }

    const polygonEntity = new Entity({
        id: id,
        show: style.visible
    });

    const polygonHierarchy = getPolygonHierarchy(geometry.coordinates);

    let heightReference = HeightReference.NONE;
    if (layerOptions && layerOptions.clampToGround) {
        heightReference = HeightReference.CLAMP_TO_GROUND;
    }

    polygonEntity.polygon = new PolygonGraphics({
        hierarchy: polygonHierarchy,
        heightReference: heightReference,
        height: style.zIndex ? undefined : 0,
        fill: style.fillColor ? true : false,
        material: style.fillColor ? new Color(...style.fillColor) : undefined,
        outline: style.strokeColor ? true : false,
        outlineColor: style.strokeColor ? new Color(...style.strokeColor) : undefined,
        outlineWidth: style.strokeWidth || 1,
        arcType: ArcType.GEODESIC,
        zIndex: style.zIndex || undefined
    });

    return polygonEntity;
};

export const updatePolygonEntityGeometry = (polygonEntity, geometry: GeoJSON.Polygon) => {
    polygonEntity.polygon.hierarchy = getPolygonHierarchy(geometry.coordinates);
};

export const updatePolygonEntityStyle = (polygonEntity, featureStyle: IFeatureStyle) => {
    const style = featureStyle.polygon;
    if (!style) {
        return;
    }

    polygonEntity.show = style.visible;

    const polygon = polygonEntity.polygon;
    if (style.fillColor) {
        polygon.fill = true;
        polygon.material = new Color(...style.fillColor);
    } else {
        polygon.fill = false;
    }
    if (style.strokeColor) {
        polygon.outline = true;
        polygon.outlineColor = new Color(...style.strokeColor);
        polygon.outlineWidth = style.strokeWidth || 1;
    } else {
        polygon.outline = false;
    }
    if (style.zIndex) {
        polygon.zIndex = style.zIndex;
    } else {
        polygon.zIndex = undefined;
        polygon.height = 0;
    }
};

export const createMultiPolygonEntity = (id, geometry: GeoJSON.MultiPolygon, featureStyle: IFeatureStyle, layerOptions) => {
    const polygonStyle = featureStyle.polygon;

    if (!polygonStyle) {
        return;
    }

    const multiPolygonEntity = new Entity({
        id: id,
        show: polygonStyle.visible
    });

    multiPolygonEntity[FEATURE_STYLE_KEY] = featureStyle;
    multiPolygonEntity[LAYER_OPTIONS_KEY] = layerOptions;

    geometry.coordinates.forEach((polygonCoords, idx) => {
        const polygonEntity = createPolygonEntity(
            `${id}_${idx}`,
            { type: 'Polygon', coordinates: polygonCoords },
            featureStyle,
            layerOptions
        );
        polygonEntity!.parent = multiPolygonEntity;
    });

    return multiPolygonEntity;
};

export const updateMultiPolygonEntityGeometry = (multiPolygonEntity: Entity, geometry: GeoJSON.MultiPolygon) => {
    // @ts-ignore: need access to private entity children
    const polygonEntities = multiPolygonEntity._children;
    const coordinates = geometry.coordinates;

    let i = 0;
    for (i = 0; i < coordinates.length; ++i) {
        if (polygonEntities[i]) updatePolygonEntityGeometry(polygonEntities[i], { type: 'Polygon', coordinates: coordinates[i] });
        else {
            const polygonEntity = createPolygonEntity(
                `${multiPolygonEntity.id}_${i}`,
                { type: 'Polygon', coordinates: coordinates[i] },
                multiPolygonEntity[FEATURE_STYLE_KEY],
                multiPolygonEntity[LAYER_OPTIONS_KEY]
            );
            polygonEntity!.parent = multiPolygonEntity;
        }
    }

    const toRemove = polygonEntities.slice(i);
    toRemove.forEach((polygonEntity) => {
        polygonEntity.parent = undefined;
        if (polygonEntity.entityCollection) {
            polygonEntity.entityCollection.remove(polygonEntity);
        }
    });
};

export const updateMultiPolygonEntityStyle = (multiPolygonEntity, featureStyle: IFeatureStyle) => {
    multiPolygonEntity.featureStyle = featureStyle;
    const polygonEntities = multiPolygonEntity._children;
    polygonEntities.forEach((polygonEntity) => {
        updatePolygonEntityStyle(polygonEntity, featureStyle);
    });
};

export const polygonEntityRenderer: CesiumGeometryEntityRenderer<GeoJSON.Polygon> = {
    create: createPolygonEntity,
    updateGeometry: updatePolygonEntityGeometry,
    updateStyle: updatePolygonEntityStyle
};

export const multiPolygonEntityRenderer: CesiumGeometryEntityRenderer<GeoJSON.MultiPolygon> = {
    create: createMultiPolygonEntity,
    updateGeometry: updateMultiPolygonEntityGeometry,
    updateStyle: updateMultiPolygonEntityStyle
};
