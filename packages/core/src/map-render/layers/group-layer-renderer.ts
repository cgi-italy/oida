import { ILayerRenderer } from './map-layer-renderer';

export interface IGroupLayerRenderer extends ILayerRenderer {
    addLayer(layer: ILayerRenderer, idx?: number);
    removeLayer(layer: ILayerRenderer);
}

export const GROUP_LAYER_ID = 'group';
