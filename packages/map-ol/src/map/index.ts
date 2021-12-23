import { IMapRendererProps, mapRendererFactory } from '@oidajs/core';

import { OLMapRenderer, OL_RENDERER_ID } from './ol-map-renderer';

declare module '@oidajs/core' {
    interface IMapRendererPropsDefinitions {
        [OL_RENDERER_ID]: IMapRendererProps;
    }
}

mapRendererFactory.register(OL_RENDERER_ID, (props) => {
    const renderer = new OLMapRenderer(props);
    return renderer;
});

export * from './ol-map-renderer';
