import { createDynamicFactory } from '@cgi-eo/map-core';

let factory = createDynamicFactory('ol-tilesources');

export const cesiumTileSourcesFactory = {
    ...factory,
    create: (id, config) => {
        return factory.create(id, {
            ...config
        });
    }
};
