import Entity from 'cesium/Source/DataSources/Entity';

import { CesiumPrimitiveFeatureLayer } from './cesium-primitive-feature-layer';
import { CesiumEntityFeatureLayer } from './cesium-entity-feature-layer';

export const createCesiumFeatureLayer = (config) => {
    if (config.cesiumEntityMode) {
        return new CesiumEntityFeatureLayer(config);
    } else {
        return new CesiumPrimitiveFeatureLayer(config);
    }
};

export const getPickedFeatureEntity = (pickInfo) => {
    let entity = pickInfo.id;
    let entityId;
    if (pickInfo.id instanceof Entity) {
        if (entity.parent) {
            entity = entity.parent;
        }
        entityId = entity.id;
    } else if (pickInfo.primitive.entityId_) {
        entityId = pickInfo.primitive.entityId_;
    }
    return entityId;
};

export const getPickedLayer = (pickInfo) => {
    let entity = pickInfo.id;
    let layer;
    if (pickInfo.id instanceof Entity) {
        if (entity.parent) {
            entity = entity.parent;
        }
        layer = entity.layer_;
    } else if (pickInfo.primitive.layer_) {
        layer = pickInfo.primitive.layer_;
    }
    return layer;
};

export { CesiumPrimitiveFeatureLayer, CesiumEntityFeatureLayer };
