import Color from 'cesium/Source/Core/Color';
import Entity from 'cesium/Source/DataSources/Entity';
import Rectangle from 'cesium/Source/Core/Rectangle';
import RectangleGraphics from 'cesium/Source/DataSources/RectangleGraphics';
import HeightReference from 'cesium/Source/Scene/HeightReference';

import { IFeatureStyle, BBoxGeometry } from '@oidajs/core';

import { CesiumGeometryEntityRenderer } from './cesium-geometry-entity-renderer-factory';

export const createBBoxEntity = (id: string, geometry: BBoxGeometry, featureStyle: IFeatureStyle, layerOptions?) => {
    const style = featureStyle.polygon;
    if (!style) {
        return;
    }

    const bboxEntity = new Entity({
        id: id,
        show: style.visible
    });

    let heightReference = HeightReference.None;
    if (layerOptions && layerOptions.clampToGround) {
        heightReference = HeightReference.CLAMP_TO_GROUND;
    }

    bboxEntity.rectangle = new RectangleGraphics({
        coordinates: Rectangle.fromDegrees(...geometry.bbox),
        heightReference: heightReference,
        fill: style.fillColor ? true : false,
        material: style.fillColor ? new Color(...style.fillColor) : undefined,
        outline: style.strokeColor ? true : false,
        outlineColor: style.strokeColor ? new Color(...style.strokeColor) : undefined,
        outlineWidth: style.strokeWidth || 1,
        zIndex: style.zIndex || 0
    });

    Object.defineProperty(bboxEntity, 'pickingDisabled', {
        value: style.pickingDisabled || false,
        writable: true
    });

    return bboxEntity;
};

export const updateBBoxEntityGeometry = (bboxEntity, geometry: BBoxGeometry) => {
    bboxEntity.rectangle.coordinates = Rectangle.fromDegrees(...geometry.bbox);
};

export const updateBBoxEntityStyle = (bboxEntity, featureStyle: IFeatureStyle) => {
    const style = featureStyle.polygon;
    if (!style) {
        return;
    }

    const rectangle = bboxEntity.rectangle;
    if (style.fillColor) {
        rectangle.fill = true;
        rectangle.material = new Color(...style.fillColor);
    } else {
        rectangle.fill = false;
    }
    if (style.strokeColor) {
        rectangle.outline = true;
        rectangle.outlineColor = new Color(...style.strokeColor);
        rectangle.outlineWidth = style.strokeWidth || 1;
    } else {
        rectangle.outline = false;
    }

    rectangle.zIndex = style.zIndex || 0;

    bboxEntity.pickingDisabled = style.pickingDisabled || false;
};

export const bboxEntityRenderer: CesiumGeometryEntityRenderer<BBoxGeometry> = {
    create: createBBoxEntity,
    updateGeometry: updateBBoxEntityGeometry,
    updateStyle: updateBBoxEntityStyle
};
