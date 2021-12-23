import {
    GROUP_LAYER_ID,
    TILE_LAYER_ID,
    FEATURE_LAYER_ID,
    GEO_IMAGE_LAYER_ID,
    VOLUME_LAYER_ID,
    VERTICAL_PROFILE_LAYER_ID
} from '@oidajs/core';

import { MapLayer } from './map-layer';
import { GroupLayer, GroupLayerProps } from './group-layer';
import { TileLayer, TileLayerProps } from './tile-layer';
import { FeatureInterface, FeatureLayer, FeatureLayerProps } from './feature-layer';
import { GeoImageLayer, GeoImageLayerProps } from './geo-image-layer';
import { VolumeLayer, VolumeLayerProps } from './volume-layer';
import { VerticalProfileLayer, VerticalProfileLayerProps } from './vertical-profile-layer';

declare module './map-layer' {
    export interface MapLayerDefinitions {
        [GROUP_LAYER_ID]: GroupLayerProps;
        [TILE_LAYER_ID]: TileLayerProps;
        [FEATURE_LAYER_ID]: FeatureLayerProps<FeatureInterface>;
        [GEO_IMAGE_LAYER_ID]: GeoImageLayerProps;
        [VOLUME_LAYER_ID]: VolumeLayerProps;
        [VERTICAL_PROFILE_LAYER_ID]: VerticalProfileLayerProps<FeatureInterface>;
    }
    export interface MapLayerTypes {
        [GROUP_LAYER_ID]: GroupLayer;
        [TILE_LAYER_ID]: TileLayer;
        [FEATURE_LAYER_ID]: FeatureLayer<FeatureInterface>;
        [GEO_IMAGE_LAYER_ID]: GeoImageLayer;
        [VOLUME_LAYER_ID]: VolumeLayer;
        [VERTICAL_PROFILE_LAYER_ID]: VerticalProfileLayer<FeatureInterface>;
    }
}

MapLayer.register(GROUP_LAYER_ID, GroupLayer);
MapLayer.register(TILE_LAYER_ID, TileLayer);
MapLayer.register(FEATURE_LAYER_ID, FeatureLayer);
MapLayer.register(GEO_IMAGE_LAYER_ID, GeoImageLayer);
MapLayer.register(VOLUME_LAYER_ID, VolumeLayer);
MapLayer.register(VERTICAL_PROFILE_LAYER_ID, VerticalProfileLayer);

export * from './map-layer';
export * from './group-layer';
export * from './tile-layer';
export * from './feature-layer';
export * from './geo-image-layer';
export * from './vertical-profile-layer';
export * from './volume-layer';
