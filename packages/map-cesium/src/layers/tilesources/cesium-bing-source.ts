import BingMapsImageryProvider from 'cesium/Source/Scene/BingMapsImageryProvider';
import BingMapsStyle from 'cesium/Source/Scene/BingMapsStyle';
import { cesiumTileSourcesFactory } from './cesium-tilesources-factory';

cesiumTileSourcesFactory.register('bing', (config) => {

    let mapStyle = BingMapsStyle.AERIAL;

    for (let key in BingMapsStyle) {
        if (config.imagerySet === BingMapsStyle[key]) {
            mapStyle = key;
            break;
        }
    }
    return new BingMapsImageryProvider({
        url: 'https://dev.virtualearth.net',
        key: config.key,
        mapStyle: mapStyle
    });
});
