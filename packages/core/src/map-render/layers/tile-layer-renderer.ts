import { ILayerRenderer } from './map-layer-renderer';

export interface ITileLayerRenderer extends ILayerRenderer {
    updateSource(source: any);
}

export const TILE_LAYER_ID = 'tile';
