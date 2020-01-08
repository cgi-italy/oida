import { createDynamicFactory } from '@oida/core';

let factory = createDynamicFactory('ol-image-source');

export const olImageSourceFactory = {
    ...factory,
    create: (type, config) => {
        return factory.create(type, {
            ...config
        });
    }
};
