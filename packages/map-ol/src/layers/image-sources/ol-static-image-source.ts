import StaticImageSource from 'ol/source/ImageStatic';

import { olImageSourceFactory } from './ol-image-source-factory';

olImageSourceFactory.register('static', (config) => {
    return new StaticImageSource(config);
});
