import { IMapLayerRenderer, MapLayerRendererConfig } from './map-layer-renderer';
import { TileSource } from './tile-sources/tile-source';

export type BaseTileGridConfig = {
    tileSize?: number | number[];
    gridSize?: number[];
    forceUniformResolution?: boolean;
    allowOptimalTileSize?: boolean;
    minZoom?: number;
    maxZoom?: number;
    minRes?: number;
    extent?: number[];
    resolutions?: number[];
};

export type WmtsTileGridConfig = BaseTileGridConfig & {
    isWMTS: true;
    matrixIds?: string[];
};

export type TileGridConfig = BaseTileGridConfig | WmtsTileGridConfig;

export const isWmtsTileGridConfig = (gridConfig: TileGridConfig): gridConfig is WmtsTileGridConfig => {
    return (gridConfig as WmtsTileGridConfig).isWMTS === true;
};

type TileGridParamsOptions = {
    extent: number[];
    tileSize: number[];
    gridSize?: number[];
    forceUniformResolution?: boolean;
};

export const computeTileGridParams = (options: TileGridParamsOptions) => {
    let { tileSize, gridSize } = options;
    const { extent, forceUniformResolution } = options;

    const extentWidth = extent[2] - extent[0];
    const extentHeight = extent[3] - extent[1];

    if (!gridSize) {
        const ratio = extentWidth / tileSize[0] / (extentHeight / tileSize[1]);
        if (ratio > 1) {
            gridSize = [Math.round(ratio), 1];
        } else {
            gridSize = [1, Math.round(1 / ratio)];
        }
    }

    if (forceUniformResolution) {
        const rootXResolution = extentWidth / gridSize[0] / tileSize[0];
        const rootYResolution = extentHeight / gridSize[1] / tileSize[1];

        if (rootXResolution < rootYResolution) {
            tileSize = [Math.ceil((tileSize[0] * rootXResolution) / rootYResolution), tileSize[1]];
        } else {
            tileSize = [tileSize[0], Math.ceil((tileSize[1] * rootYResolution) / rootXResolution)];
        }
    }

    return {
        tileSize,
        gridSize
    };
};

export type TileLayerRendererConfig = MapLayerRendererConfig & {
    source?: TileSource;
    minZoomLevel?: number;
    maxZoomLevel?: number;
    onTileLoadStart?: () => void;
    onTileLoadEnd?: () => void;
};

export interface ITileLayerRenderer extends IMapLayerRenderer {
    updateSource(source: TileSource | undefined): void;
    setMinZoomLevel(level: number | undefined): void;
    setMaxZoomLevel(level: number | undefined): void;
    forceRefresh(): void;
}

export const TILE_LAYER_ID = 'tile';

declare module './map-layer-renderer' {
    export interface IMapLayerRendererConfigDefinitions {
        [TILE_LAYER_ID]: TileLayerRendererConfig;
    }
}
