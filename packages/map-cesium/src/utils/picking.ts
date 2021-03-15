import Entity from 'cesium/Source/DataSources/Entity';

import { CesiumMapLayer } from '../layers/cesium-map-layer';

export enum CesiumFeatureCoordPickMode {
    Ellipsoid = 'ELLIPSOID',
    Primitive = 'PRIMITIVE'
}

export const PICK_INFO_KEY = '__oida_pick_info__';

export type PickInfo<T = any> = {
    id: string;
    data: T;
    layer: CesiumMapLayer;
    pickable: boolean;
    cesiumPickObject?: any;
};


export const getPickInfo = (cesiumPickObject) => {
    let primitive;
    if (cesiumPickObject.id instanceof Entity) {
        primitive = cesiumPickObject.id;
        if (primitive.parent) {
            primitive = primitive.parent;
        }
    } else if (cesiumPickObject.primitive) {
        primitive = cesiumPickObject.primitive;
    }
    if (primitive) {
        const pickInfo = primitive[PICK_INFO_KEY];
        if (pickInfo) {
            return {
                ...pickInfo,
                cesiumPickObject: cesiumPickObject
            } as PickInfo;
        }
    }
};

export const setNonPickableFeaturesVisibility = (cesiumPickObjectList, visible) => {
    let hasNonPickableObjects = false;
    cesiumPickObjectList.forEach((cesiumPickObject) => {
        if (!getPickInfo(cesiumPickObject)?.pickable) {
            cesiumPickObject.primitive.show = visible;
            if (cesiumPickObject.id instanceof Entity) {
                cesiumPickObject.id.show = false;
            }
            hasNonPickableObjects = true;
        }
    });
    return hasNonPickableObjects;
};

