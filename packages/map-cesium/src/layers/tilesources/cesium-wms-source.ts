import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';

import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';
import { getTileSchemeFromSRS } from '../../utils/projection';

cesiumTileSourcesFactory.register('wms', (config) => {
    let scheme = getTileSchemeFromSRS(config.srs || 'EPSG:4326');
    if (scheme) {
        return new WebMapServiceImageryProvider({
            url: config.url,
            layers: config.layers,
            parameters: config.parameters,
            enablePickFeatures: false,
            tilingScheme: scheme
        });
    }
});
