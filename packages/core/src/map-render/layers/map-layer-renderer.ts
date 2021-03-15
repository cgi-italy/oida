import { IMapRenderer } from '../map/map-renderer';

export type MapLayerConfig = {
    mapRenderer: IMapRenderer;
    zIndex?: number;
    visible?: boolean;
    opacity?: number;
    extent: number[] | null | undefined
};

export interface ILayerRenderer {
    setVisible(visible: boolean): void;
    setOpacity(opacity: number): void;
    setZIndex(setZIndex: number): void;
    setExtent(extent: number[] | null | undefined): void;
    destroy(): void;
}
