import Entity from 'cesium/Source/DataSources/Entity';

import { CesiumPrimitiveFeatureLayer } from './cesium-primitive-feature-layer';
import { CesiumEntityFeatureLayer } from './cesium-entity-feature-layer';
import { CesiumMapLayer } from './cesium-map-layer';

export const createCesiumFeatureLayer = (config) => {
    if (config.entityMode) {
        return new CesiumEntityFeatureLayer(config);
    } else {
        return new CesiumPrimitiveFeatureLayer(config);
    }
};

export { CesiumPrimitiveFeatureLayer, CesiumEntityFeatureLayer };
