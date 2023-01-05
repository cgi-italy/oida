import { Cartesian2, CesiumWidget, Entity } from 'cesium';

import { CesiumMapLayer } from '../layers/cesium-map-layer';

export enum CesiumFeatureCoordPickMode {
    Ellipsoid = 'ELLIPSOID',
    Primitive = 'PRIMITIVE'
}

export const PICK_INFO_KEY = '__oida_pick_info__';

export type CesiumPickObject = any;

export type PickInfo<T = any> = {
    id: string;
    data: T;
    layer: CesiumMapLayer;
    pickable: boolean;
    cesiumPickObject?: CesiumPickObject;
};

export const getPickInfo = (cesiumPickObject: CesiumPickObject) => {
    let primitive;
    if (cesiumPickObject.id instanceof Entity) {
        primitive = cesiumPickObject.id;
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

export const setNonPickableFeaturesVisibility = (cesiumPickObjectList: CesiumPickObject[], visible: boolean) => {
    let hasNonPickableObjects = false;
    cesiumPickObjectList.forEach((cesiumPickObject) => {
        if (!getPickInfo(cesiumPickObject)?.pickable) {
            if (cesiumPickObject.id instanceof Entity) {
                cesiumPickObject.id.show = visible;
            }
            if (cesiumPickObject.primitive) {
                cesiumPickObject.primitive.show = visible;
            }
            hasNonPickableObjects = true;
        }
    });
    return hasNonPickableObjects;
};

export const pickCoordinate = (
    viewer: CesiumWidget,
    mousePosition: Cartesian2,
    mode: CesiumFeatureCoordPickMode,
    cesiumPickObjectList: CesiumPickObject[]
) => {
    if (mode === CesiumFeatureCoordPickMode.Ellipsoid) {
        return viewer.camera.pickEllipsoid(mousePosition, viewer.scene.globe.ellipsoid);
    } else {
        // enable translucent objects picking during picking rendering pass
        viewer.scene.pickTranslucentDepth = true;
        // hide non pickable objects
        setNonPickableFeaturesVisibility(cesiumPickObjectList, false);
        // picking rendering pass
        viewer.scene.render();
        const coordinate = viewer.scene.pickPosition(mousePosition);
        // restore visibility
        setNonPickableFeaturesVisibility(cesiumPickObjectList, true);
        // disable translucent objects picking
        viewer.scene.pickTranslucentDepth = false;
        return coordinate;
    }
};
