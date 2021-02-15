import { ILayerRenderer } from './map-layer-renderer';

export type TileSource = Record<string, any>;

export type TileGridConfig = {
    tileSize?: number | number[];
    gridSize?: number[];
    forceUniformResolution?: boolean;
    minZoom?: number;
    maxZoom?: number;
    extent?: number[];
    resolutions?: number[];
    matrixIds?: string[];
    isWMTS?: boolean;
};

type TileGridParamsOptions = {
    extent: number[];
    tileSize: number[];
    gridSize?: number[];
    forceUniformResolution?: boolean;
};

export const computeTileGridParams = (options: TileGridParamsOptions) => {

    let {extent, tileSize, gridSize, forceUniformResolution} = options;

    const extentWidth = extent[2] - extent[0];
    const extentHeight = extent[3] - extent[1];

    if (!gridSize) {

        const ratio = (extentWidth / tileSize[0]) / (extentHeight / tileSize[1]);
        if (ratio > 1) {
            gridSize = [Math.round(ratio), 1];
        } else {
            gridSize = [1, Math.round(1 / ratio)];
        }
    }

    if (forceUniformResolution) {
        let rootXResolution = (extentWidth / gridSize[0]) / tileSize[0];
        let rootYResolution = (extentHeight / gridSize[1]) / tileSize[1];

        if (rootXResolution < rootYResolution) {
            tileSize = [tileSize[0], Math.ceil(tileSize[1] * rootYResolution / rootXResolution)];
        } else {
            tileSize = [Math.ceil(tileSize[0] * rootXResolution / rootYResolution), tileSize[1]];
        }
    }

    return {
        tileSize,
        gridSize
    };
};

export interface ITileLayerRenderer extends ILayerRenderer {
    updateSource(source: any): void;
    setMinZoomLevel(level: number | undefined): void;
    setMaxZoomLevel(level: number | undefined): void;
    forceRefresh() : void;
}

export const TILE_LAYER_ID = 'tile';
