import { createDynamicFactory } from '@oida/core';

let factory = createDynamicFactory('ol-tilesources');

export const olTileSourcesFactory = {
    ...factory,
    create: (id, config) => {
        return factory.create(id, {
            ...config
        });
    }
};
