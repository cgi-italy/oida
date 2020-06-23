import Entity from 'cesium/Source/DataSources/Entity';

import { CesiumPrimitiveFeatureLayer } from './cesium-primitive-feature-layer';
import { CesiumEntityFeatureLayer } from './cesium-entity-feature-layer';

export const createCesiumFeatureLayer = (config) => {
    if (config.entityMode) {
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

export const isFeaturePickable = (pickInfo) => {
    if (pickInfo.id instanceof Entity) {
        return !pickInfo.id.pickingDisabled;
    } else {
        return pickInfo.primitive.entityId_ && !pickInfo.primitive.pickingDisabled_;
    }
};

export const setNonPickableFeaturesVisibility = (pickInfoList, visible) => {
    pickInfoList.forEach((pickInfo) => {
        if (pickInfo.id instanceof Entity && pickInfo.id.pickingDisabled) {
            pickInfo.id.show = visible;
            pickInfo.primitive.show = visible;
        } else if (pickInfo.primitive && pickInfo.primitive.pickingDisabled_) {
            pickInfo.primitive.show = visible;
        }
    });
};

export const getPickCallbacks = (pickInfo) => {
    if (pickInfo.id instanceof Entity) {
        return pickInfo.id.pickCallbacks_ || {};
    } else {
        return pickInfo.primitive?.pickCallbacks_ || {};
    }
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
