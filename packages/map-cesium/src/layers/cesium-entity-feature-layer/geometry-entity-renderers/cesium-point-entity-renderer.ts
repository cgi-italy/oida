import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Color from 'cesium/Source/Core/Color';
import Entity from 'cesium/Source/DataSources/Entity';
import HeightReference from 'cesium/Source/Scene/HeightReference';
import BillboardGraphics from 'cesium/Source/DataSources/BillboardGraphics';
import PointGraphics from 'cesium/Source/DataSources/PointGraphics';

import { IFeatureStyle, IPointStyle, isIcon } from '@oidajs/core';

import { CesiumGeometryEntityRenderer } from './cesium-geometry-entity-renderer-factory';

const getPropsFromStyle = (style: IPointStyle) => {
    if (isIcon(style)) {
        return {
            color: style.color ? new Color(...style.color) : undefined,
            image: style.url,
            scale: style.scale || 1.0,
            rotation: style.rotation || 0.0,
        };
    } else {
        return {
            pixelSize: style.radius || 1,
            color: style.fillColor ? new Color(...style.fillColor) : undefined,
            outlineColor: style.strokeColor ? new Color(...style.strokeColor) : undefined
        };
    }
};

export const createPointEntity = (id: string, geometry: GeoJSON.Point, featureStyle: IFeatureStyle, layerOptions?) => {

    let style = featureStyle.point;
    if (!style) {
        return;
    }

    let pointEntity = new Entity({
        id: id,
        position: Cartesian3.fromDegrees(...geometry.coordinates),
        show: style.visible
    });

    let heightReference = HeightReference.None;
    if (layerOptions && layerOptions.clampToGround) {
        heightReference = geometry.coordinates.length === 2 ? HeightReference.CLAMP_TO_GROUND : HeightReference.RELATIVE_TO_GROUND;
    }

    if (isIcon(style)) {
        let billboard = new BillboardGraphics({
            color: style.color ? new Color(...style.color) : undefined,
            image: style.url,
            scale: style.scale || 1.0,
            rotation: style.rotation || 0.0,
            heightReference: heightReference,
            eyeOffset: new Cartesian3(0, 0, -100 * (style.zIndex || 0))
        });
        pointEntity.billboard = billboard;
    } else {
        let point = new PointGraphics({
            pixelSize: style.radius ? style.radius * 2 : 1,
            color: style.fillColor ? new Color(...style.fillColor) : undefined,
            outlineColor: style.strokeColor ? new Color(...style.strokeColor) : undefined
        });
        pointEntity.point = point;
    }

    return pointEntity;
};

export const updatePointEntityGeometry = (pointEntity, geometry: GeoJSON.Point) => {
    pointEntity.position = Cartesian3.fromDegrees(...geometry.coordinates);
};

export const updatePointEntityStyle = (pointEntity, featureStyle: IFeatureStyle) => {

    let style = featureStyle.point;
    if (!style) {
        return;
    }

    if (isIcon(style)) {
        pointEntity.point = undefined;
        let billboard = pointEntity.billboard;
        if (!billboard) {
            billboard = new BillboardGraphics();
            pointEntity.billboard = billboard;
        }
        billboard.image = style.url;
        if (style.color) {
            billboard.color = new Color(...style.color);
        }
        if (style.scale) {
            billboard.scale = style.scale;
        }
        if (style.rotation) {
            billboard.rotation = style.rotation;
        }

        billboard.eyeOffset = new Cartesian3(0, 0, -100 * (style.zIndex || 0));

    } else {
        pointEntity.billboard = undefined;
        let point = pointEntity.point;
        if (!point) {
            point = new PointGraphics();
            pointEntity.point = point;
        }
        if (style.fillColor) {
            point.color = new Color(...style.fillColor);
        }
        if (style.strokeColor) {
            point.outlineColor = new Color(...style.strokeColor);
        }
        if (style.radius) {
            point.pixelSize = style.radius * 2;
        }
    }

};

export const createMultiPointEntity = (id, geometry: GeoJSON.MultiPoint, featureStyle: IFeatureStyle, layerOptions) => {

    let pointStyle = featureStyle.point;

    if (!pointStyle) {
        return;
    }

    let multiPointEntity = new Entity({
        id: id,
        show: pointStyle.visible
    });

    multiPointEntity.featureStyle = featureStyle;
    multiPointEntity.layerOptions = layerOptions;

    let pointEntities = geometry.coordinates.map((pointCoords, idx) => {
        let pointEntity = createPointEntity(
            `${id}_${idx}`,
            {type: 'Point', coordinates: pointCoords},
            featureStyle,
            layerOptions
        );
        pointEntity.parent = multiPointEntity;
    });

    return multiPointEntity;
};

export const updateMultiPointEntityGeometry = (multiPointEntity, geometry: GeoJSON.MultiPoint) => {
    let pointEntities = multiPointEntity._children;
    let coordinates = geometry.coordinates;

    let i = 0;
    for (i = 0; i < coordinates.length; ++i) {
        if (pointEntities[i])
            updatePointEntityGeometry(
                pointEntities[i],
                {type: 'Point', coordinates: coordinates[i]}
            );
        else {
            let pointEntity = createPointEntity(
                `${multiPointEntity.id}_${i}`,
                {type: 'Point', coordinates: coordinates[i]},
                multiPointEntity.featureStyle,
                multiPointEntity.layerOptions
            );
            pointEntity.parent = multiPointEntity;
        }
    }

    let toRemove = pointEntities.slice(i);
    toRemove.forEach((pointEntity) => {
        pointEntity.parent = undefined;
        if (pointEntity.entityCollection) {
            pointEntity.entityCollection.remove(pointEntity);
        }
    });

};

export const updateMultiPointEntityStyle = (multiPointEntity, featureStyle: IFeatureStyle) => {

    multiPointEntity.featureStyle = featureStyle;
    let pointEntities = multiPointEntity._children;
    pointEntities.forEach((pointEntity) => {
        updatePointEntityStyle(pointEntity, featureStyle);
    });
};

export const pointEntityRenderer: CesiumGeometryEntityRenderer<GeoJSON.Point> = {
    create: createPointEntity,
    updateGeometry: updatePointEntityGeometry,
    updateStyle: updatePointEntityStyle
};

export const multiPointEntityRenderer: CesiumGeometryEntityRenderer<GeoJSON.MultiPoint> = {
    create: createMultiPointEntity,
    updateGeometry: updateMultiPointEntityGeometry,
    updateStyle: updateMultiPointEntityStyle
};
