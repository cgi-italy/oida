import TileSource from 'ol/source/Tile';

import { createDynamicFactory, IDynamicFactory, ITileSourceDefinitions } from '@oidajs/core';

const factory = createDynamicFactory<TileSource, ITileSourceDefinitions, { wrapX?: boolean }>('ol-tile-sources');

export const olTileSourcesFactory: IDynamicFactory<TileSource, ITileSourceDefinitions, { wrapX?: boolean }> = {
    ...factory,
    create: (id, config) => {
        return factory.create(id, {
            ...config
        });
    }
};
