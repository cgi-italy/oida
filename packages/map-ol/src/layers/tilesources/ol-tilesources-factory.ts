import TileSource from 'ol/source/Tile';

import { createDynamicFactory, IDynamicFactory, ITileSourceDefinitions } from '@oidajs/core';

const factory = createDynamicFactory<TileSource, ITileSourceDefinitions, { wrapX?: boolean; credits?: string }>('ol-tile-sources');

export const olTileSourcesFactory: IDynamicFactory<TileSource, ITileSourceDefinitions, { wrapX?: boolean; credits?: string }> = {
    ...factory,
    create: (id, config) => {
        const tileSource = factory.create(id, {
            ...config
        });
        if (tileSource && config.credits) {
            tileSource?.setAttributions(config.credits);
        }
        return tileSource;
    }
};
