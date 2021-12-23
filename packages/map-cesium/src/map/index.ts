import { mapRendererFactory } from '@oidajs/core';
import { CESIUM_RENDERER_ID, CesiumMapRenderer, CesiumMapRendererProps } from './cesium-map-renderer';

declare module '@oidajs/core' {
    interface IMapRendererPropsDefinitions {
        [CESIUM_RENDERER_ID]: CesiumMapRendererProps;
    }
}

mapRendererFactory.register(CESIUM_RENDERER_ID, (props) => {
    const renderer = new CesiumMapRenderer(props);
    return renderer;
});

export * from './cesium-map-renderer';
