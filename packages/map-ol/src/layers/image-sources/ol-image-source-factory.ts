import { createDynamicFactory } from '@oidajs/core';

const factory = createDynamicFactory('ol-image-source');

export const olImageSourceFactory = {
    ...factory,
    create: (type, config) => {
        return factory.create(type, {
            ...config
        });
    }
};
