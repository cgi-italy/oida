import { IMapRendererProps, mapRendererFactory } from '@oida/core';

import { OLMapRenderer, OL_RENDERER_ID } from './ol-map-renderer';

declare module '@oida/core' {
    interface IMapRendererPropsDefinitions {
        [OL_RENDERER_ID]:  IMapRendererProps;
    }
}

mapRendererFactory.register(OL_RENDERER_ID, (props) => {
    let renderer =  new OLMapRenderer(props);
    return renderer;
});


export * from './ol-map-renderer';

