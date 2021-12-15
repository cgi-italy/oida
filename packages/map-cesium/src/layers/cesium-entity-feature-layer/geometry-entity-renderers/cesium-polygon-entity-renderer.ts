import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import ArcType from 'cesium/Source/Core/ArcType';
import Entity from 'cesium/Source/DataSources/Entity';
import PolygonHierarchy from 'cesium/Source/Core/PolygonHierarchy';
import PolygonGraphics from 'cesium/Source/DataSources/PolygonGraphics';
import HeightReference from 'cesium/Source/Scene/HeightReference';

import { CesiumGeometryEntityRenderer } from './cesium-geometry-entity-renderer-factory';

import { IFeatureStyle } from '@oidajs/core';


const getPolygonHierarchy = (coordinates) => {
    let outer = coordinates[0];
    let holes: any[] = [];
    for (let i = 1; i < coordinates.length; ++i) {
        if (coordinates[i].length > 2) {
            holes.push(new PolygonHierarchy(
                Cartesian3.fromDegreesArray(([] as any[]).concat(...coordinates[i]))
            ));
        }
    }

    return new PolygonHierarchy(
        Cartesian3.fromDegreesArray(([] as any).concat(...outer)),
        holes
    );
};


export const createPolygonEntity = (id: string, geometry: GeoJSON.Polygon, featureStyle: IFeatureStyle, layerOptions?) => {
    let style = featureStyle.polygon;
    if (!style) {
        return;
    }

    let polygonEntity = new Entity({
        id: id,
        show: style.visible
    });

    let polygonHierarchy = getPolygonHierarchy(geometry.coordinates);

    let heightReference = HeightReference.None;
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
    let style = featureStyle.polygon;
    if (!style) {
        return;
    }

    polygonEntity.show = style.visible;

    let polygon = polygonEntity.polygon;
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

    let polygonStyle = featureStyle.polygon;

    if (!polygonStyle) {
        return;
    }

    let multiPolygonEntity = new Entity({
        id: id,
        show: polygonStyle.visible
    });

    multiPolygonEntity.featureStyle = featureStyle;
    multiPolygonEntity.layerOptions = layerOptions;

    let polygonEntities = geometry.coordinates.map((polygonCoords, idx) => {
        let polygonEntity = createPolygonEntity(
            `${id}_${idx}`,
            {type: 'Polygon', coordinates: polygonCoords},
            featureStyle,
            layerOptions
        );
        polygonEntity.parent = multiPolygonEntity;
    });

    return multiPolygonEntity;
};

export const updateMultiPolygonEntityGeometry = (multiPolygonEntity, geometry: GeoJSON.MultiPolygon) => {
    let polygonEntities = multiPolygonEntity._children;
    let coordinates = geometry.coordinates;

    let i = 0;
    for (i = 0; i < coordinates.length; ++i) {
        if (polygonEntities[i])
            updatePolygonEntityGeometry(
                polygonEntities[i],
                {type: 'Polygon', coordinates: coordinates[i]}
            );
        else {
            let polygonEntity = createPolygonEntity(
                `${multiPolygonEntity.id}_${i}`,
                {type: 'Polygon', coordinates: coordinates[i]},
                multiPolygonEntity.featureStyle,
                multiPolygonEntity.layerOptions
            );
            polygonEntity.parent = multiPolygonEntity;
        }
    }

    let toRemove = polygonEntities.slice(i);
    toRemove.forEach((polygonEntity) => {
        polygonEntity.parent = undefined;
        if (polygonEntity.entityCollection) {
            polygonEntity.entityCollection.remove(polygonEntity);
        }
    });

};

export const updateMultiPolygonEntityStyle = (multiPolygonEntity, featureStyle: IFeatureStyle) => {

    multiPolygonEntity.featureStyle = featureStyle;
    let polygonEntities = multiPolygonEntity._children;
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
