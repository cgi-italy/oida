import OSM from 'ol/source/OSM';

import { olTileSourcesFactory } from './ol-tilesources-factory';

olTileSourcesFactory.register('osm', (config) => {
    return new OSM(config);
});
