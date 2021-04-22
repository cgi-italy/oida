import { IMapLayerRenderer, MapLayerRendererConfig } from './map-layer-renderer';

export type GroupLayerRendererConfig = MapLayerRendererConfig;

export interface IGroupLayerRenderer extends IMapLayerRenderer {
    addLayer(layer: IMapLayerRenderer, idx?: number);
    removeLayer(layer: IMapLayerRenderer);
}

export const GROUP_LAYER_ID = 'group';

declare module './map-layer-renderer' {
    export interface IMapLayerRendererConfigDefinitions {
        [GROUP_LAYER_ID]: GroupLayerRendererConfig;
    }
}
