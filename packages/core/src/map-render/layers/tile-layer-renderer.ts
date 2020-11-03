import { ILayerRenderer } from './map-layer-renderer';

export interface ITileLayerRenderer extends ILayerRenderer {
    updateSource(source: any): void;
    setMinZoomLevel(level: number | undefined): void;
    setMaxZoomLevel(level: number | undefined): void;
    forceRefresh() : void;
}

export const TILE_LAYER_ID = 'tile';
