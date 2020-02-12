import { ILayerRenderer } from './map-layer-renderer';

export interface ITileLayerRenderer extends ILayerRenderer {
    updateSource(source: any): void;
    forceRefresh() : void;
}

export const TILE_LAYER_ID = 'tile';
