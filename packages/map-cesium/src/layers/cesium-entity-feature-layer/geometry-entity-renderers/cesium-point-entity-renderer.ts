import { Cartesian3, Color, Entity, HeightReference, BillboardGraphics, PointGraphics } from 'cesium';

import { IFeatureStyle, isIcon, MapCoord } from '@oidajs/core';

import { CesiumGeometryEntityRenderer } from './cesium-geometry-entity-renderer-factory';

const FEATURE_STYLE_KEY = 'featureStyle';
const LAYER_OPTIONS_KEY = 'layerOptions';

export const createPointEntity = (id: string, geometry: GeoJSON.Point, featureStyle: IFeatureStyle, layerOptions?) => {
    const style = featureStyle.point;
    if (!style) {
        return;
    }

    const pointEntity = new Entity({
        id: id,
        position: Cartesian3.fromDegrees(...(geometry.coordinates as MapCoord)),
        show: style.visible
    });

    let heightReference = HeightReference.NONE;
    if (layerOptions && layerOptions.clampToGround) {
        heightReference = geometry.coordinates.length === 2 ? HeightReference.CLAMP_TO_GROUND : HeightReference.RELATIVE_TO_GROUND;
    }

    if (isIcon(style)) {
        const billboard = new BillboardGraphics({
            color: style.color ? new Color(...style.color) : undefined,
            image: style.url,
            scale: style.scale || 1.0,
            rotation: style.rotation || 0.0,
            heightReference: heightReference,
            eyeOffset: new Cartesian3(0, 0, -100 * (style.zIndex || 0))
        });
        pointEntity.billboard = billboard;
    } else {
        const point = new PointGraphics({
            pixelSize: style.radius ? style.radius * 2 : 1,
            color: style.fillColor ? new Color(...style.fillColor) : undefined,
            outlineColor: style.strokeColor ? new Color(...style.strokeColor) : undefined
        });
        pointEntity.point = point;
    }

    return pointEntity;
};

export const updatePointEntityGeometry = (pointEntity, geometry: GeoJSON.Point) => {
    pointEntity.position = Cartesian3.fromDegrees(...(geometry.coordinates as MapCoord));
};

export const updatePointEntityStyle = (pointEntity, featureStyle: IFeatureStyle) => {
    const style = featureStyle.point;
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
    const pointStyle = featureStyle.point;

    if (!pointStyle) {
        return;
    }

    const multiPointEntity = new Entity({
        id: id,
        show: pointStyle.visible
    });

    multiPointEntity[FEATURE_STYLE_KEY] = featureStyle;
    multiPointEntity[LAYER_OPTIONS_KEY] = layerOptions;

    geometry.coordinates.forEach((pointCoords, idx) => {
        const pointEntity = createPointEntity(`${id}_${idx}`, { type: 'Point', coordinates: pointCoords }, featureStyle, layerOptions);
        pointEntity!.parent = multiPointEntity;
    });

    return multiPointEntity;
};

export const updateMultiPointEntityGeometry = (multiPointEntity: Entity, geometry: GeoJSON.MultiPoint) => {
    // @ts-ignore: need access to private entity children
    const pointEntities = multiPointEntity._children;
    const coordinates = geometry.coordinates;

    let i = 0;
    for (i = 0; i < coordinates.length; ++i) {
        if (pointEntities[i]) updatePointEntityGeometry(pointEntities[i], { type: 'Point', coordinates: coordinates[i] });
        else {
            const pointEntity = createPointEntity(
                `${multiPointEntity.id}_${i}`,
                { type: 'Point', coordinates: coordinates[i] },
                multiPointEntity[FEATURE_STYLE_KEY],
                multiPointEntity[LAYER_OPTIONS_KEY]
            );
            pointEntity!.parent = multiPointEntity;
        }
    }

    const toRemove = pointEntities.slice(i);
    toRemove.forEach((pointEntity) => {
        pointEntity.parent = undefined;
        if (pointEntity.entityCollection) {
            pointEntity.entityCollection.remove(pointEntity);
        }
    });
};

export const updateMultiPointEntityStyle = (multiPointEntity: Entity, featureStyle: IFeatureStyle) => {
    multiPointEntity[FEATURE_STYLE_KEY] = featureStyle;
    // @ts-ignore: need access to private entity children
    const pointEntities = multiPointEntity._children;
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
