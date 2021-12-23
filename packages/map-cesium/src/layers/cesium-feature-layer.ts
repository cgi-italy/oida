import { FeatureLayerRendererConfig } from '@oidajs/core';

import { CesiumPrimitiveFeatureLayer } from './cesium-primitive-feature-layer';
import { CesiumEntityFeatureLayer } from './cesium-entity-feature-layer';
import { CesiumFeatureCoordPickMode } from '../utils/picking';

export type CesiumFeatureLayerProps = {
    clampToGround?: boolean;
    entityMode?: boolean;
    coordPickMode?: CesiumFeatureCoordPickMode;
};

export const createCesiumFeatureLayer = (config: FeatureLayerRendererConfig & CesiumFeatureLayerProps) => {
    if (config.entityMode) {
        return new CesiumEntityFeatureLayer(config);
    } else {
        return new CesiumPrimitiveFeatureLayer(config);
    }
};

export { CesiumPrimitiveFeatureLayer, CesiumEntityFeatureLayer };
