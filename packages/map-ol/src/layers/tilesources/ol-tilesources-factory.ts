import TileImage from 'ol/source/TileImage';

import { createDynamicFactory, IDynamicFactory, ITileSourceDefinitions } from '@oida/core';

let factory = createDynamicFactory<TileImage, ITileSourceDefinitions, {wrapX?: boolean}>('ol-tile-sources');

export const olTileSourcesFactory: IDynamicFactory<TileImage, ITileSourceDefinitions, {wrapX?: boolean}> = {
    ...factory,
    create: (id, config) => {
        return factory.create(id, {
            ...config
        });
    }
};
