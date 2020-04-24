import { ILayerRenderer, MapLayerConfig } from './map-layer-renderer';

export type VolumeExtent = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
};

export type VolumeTileGrid = {
    srs: string;
    extent: VolumeExtent;
    numLevels: number;
    numRootTiles: number[];
    tileSize: number[];
};

export type VolumeTileKey = {
    level: number;
    x: number;
    y: number;
    z: number;
};

export type VolumeSliceData = HTMLImageElement | HTMLCanvasElement | ArrayBufferView;

export type VolumeSliceUrl = {
    z: number,
    url: string
};

export type VolumeSourceConfig = {
    tileGrid: VolumeTileGrid;
    tileSliceUrls: (tileKey: VolumeTileKey, tileExtent: VolumeExtent) => Array<VolumeSliceUrl>;
    tileSliceLoader?: (slice: VolumeSliceUrl, sliceData: ArrayBuffer) => Promise<VolumeSliceData>;
};

export type VolumeColorMap = {
    range: {
        min: number,
        max: number
    };
    clamp: boolean;
    noData: number;
    image: HTMLImageElement | HTMLCanvasElement
};

export interface IVolumeViewMode {
    destroy: () => void;
}

export interface StackVolumeView extends IVolumeViewMode {
    setNumSlices: (numSlices) => void;
}

export interface SliceVolumeView extends IVolumeViewMode {
    setXSlice: (xSlice: number | undefined) => void;
    setYSlice: (ySlice: number | undefined) => void;
    setZSlice: (zSlice: number | undefined) => void;
}

export const SLICE_VOLUME_VIEW_ID = 'sliceView';
export const STACK_VOLUME_VIEW_ID = 'stackView';


export type VolumeLayerConfig = {
    onSliceLoadStart: () => void;
    onSliceLoadEnd: () => void;
    mapLayer: MapLayerConfig & {
        source: VolumeSourceConfig,
        colorMap?: VolumeColorMap
    }
};


export interface IVolumeLayerRenderer extends ILayerRenderer {
    setViewMode: (mode: string) => IVolumeViewMode | undefined;
    updateSource: (source?: VolumeSourceConfig) => void;
    forceRefresh: () => void;
    setColorMap: (colorMap: HTMLImageElement | HTMLCanvasElement) => void;
    setMapRange: (range: {
        min: number,
        max: number
    }) => void;
    setClamp: (clamp: boolean) => void;
    setNoDataValue: (noDataValue: number) => void;
    setVerticalScale: (verticalScale: number) => void;
}

export const VOLUME_LAYER_ID = 'volume';
