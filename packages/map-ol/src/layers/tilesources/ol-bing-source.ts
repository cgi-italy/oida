import Bing from 'ol/source/BingMaps';

import { olTileSourcesFactory } from './ol-tilesources-factory';

olTileSourcesFactory.register('bing', (config) => {
    return new Bing(config);
});
