import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import Entity from 'cesium/Source/DataSources/Entity';
import PolylineGraphics from 'cesium/Source/DataSources/PolylineGraphics';

import { IFeatureStyle } from '@oidajs/core';

import { CesiumGeometryEntityRenderer } from './cesium-geometry-entity-renderer-factory';

export const createLineEntity = (id: string, geometry: GeoJSON.LineString, featureStyle: IFeatureStyle, layerOptions?) => {
    const style = featureStyle.line;
    if (!style) {
        return;
    }

    const lineEntity = new Entity({
        id: id,
        show: style.visible
    });

    lineEntity.polyline = new PolylineGraphics({
        positions: Cartesian3.fromDegreesArray(([] as any[]).concat(...geometry.coordinates)),
        width: style.width || 1,
        material: style.color ? new Color(...style.color) : undefined,
        zIndex: style.zIndex || 0,
        clampToGround: layerOptions && layerOptions.clampToGround ? true : false
    });

    return lineEntity;
};

export const updateLineEntityGeometry = (lineEntity, geometry: GeoJSON.LineString) => {
    lineEntity.polyline.positions = Cartesian3.fromDegreesArray(([] as any[]).concat(...geometry.coordinates));
};

export const updateLineEntityStyle = (lineEntity, featureStyle: IFeatureStyle) => {
    const style = featureStyle.line;
    if (!style) {
        return;
    }

    lineEntity.show = style.visible;

    const polyline = lineEntity.polyline;
    if (style.color) {
        polyline.material = new Color(...style.color);
    }
    if (style.width) {
        polyline.width = style.width;
    }
    polyline.zIndex = style.zIndex || 0;
};

export const createMultiLineEntity = (id, geometry: GeoJSON.MultiLineString, featureStyle: IFeatureStyle, layerOptions) => {
    const lineStyle = featureStyle.line;

    if (!lineStyle) {
        return;
    }

    const multiLineEntity = new Entity({
        id: id,
        show: lineStyle.visible
    });

    multiLineEntity.featureStyle = featureStyle;
    multiLineEntity.layerOptions = layerOptions;

    geometry.coordinates.forEach((lineCoords, idx) => {
        const lineEntity = createLineEntity(`${id}_${idx}`, { type: 'LineString', coordinates: lineCoords }, featureStyle, layerOptions);
        lineEntity.parent = multiLineEntity;
    });

    return multiLineEntity;
};

export const updateMultiLineEntityGeometry = (multiLineEntity, geometry: GeoJSON.MultiLineString) => {
    const lineEntities = multiLineEntity._children;
    const coordinates = geometry.coordinates;

    let i = 0;
    for (i = 0; i < coordinates.length; ++i) {
        if (lineEntities[i]) updateLineEntityGeometry(lineEntities[i], { type: 'LineString', coordinates: coordinates[i] });
        else {
            const lineEntity = createLineEntity(
                `${multiLineEntity.id}_${i}`,
                { type: 'LineString', coordinates: coordinates[i] },
                multiLineEntity.featureStyle,
                multiLineEntity.layerOptions
            );
            lineEntity.parent = multiLineEntity;
        }
    }

    const toRemove = lineEntities.slice(i);
    toRemove.forEach((lineEntity) => {
        lineEntity.parent = undefined;
        if (lineEntity.entityCollection) {
            lineEntity.entityCollection.remove(lineEntity);
        }
    });
};

export const updateMultiLineEntityStyle = (multiLineEntity, featureStyle: IFeatureStyle) => {
    multiLineEntity.featureStyle = featureStyle;
    const lineEntities = multiLineEntity._children;
    lineEntities.forEach((lineEntity) => {
        updateLineEntityStyle(lineEntity, featureStyle);
    });
};

export const lineEntityRenderer: CesiumGeometryEntityRenderer<GeoJSON.LineString> = {
    create: createLineEntity,
    updateGeometry: updateLineEntityGeometry,
    updateStyle: updateLineEntityStyle
};

export const multiLineEntityRenderer: CesiumGeometryEntityRenderer<GeoJSON.MultiLineString> = {
    create: createMultiLineEntity,
    updateGeometry: updateMultiLineEntityGeometry,
    updateStyle: updateMultiLineEntityStyle
};
