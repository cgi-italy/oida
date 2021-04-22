import { mapRendererFactory } from '@oida/core';
import { CESIUM_RENDERER_ID, CesiumMapRenderer, CesiumMapRendererProps } from './cesium-map-renderer';

declare module '@oida/core' {
    interface IMapRendererPropsDefinitions {
        [CESIUM_RENDERER_ID]:  CesiumMapRendererProps;
    }
}

mapRendererFactory.register(CESIUM_RENDERER_ID, (props) => {
    let renderer =  new CesiumMapRenderer(props);
    return renderer;
});

export * from './cesium-map-renderer';
