import { IMapRenderer } from '../map/map-renderer';

export type MapLayerRendererConfig = {
    mapRenderer: IMapRenderer;
    zIndex?: number;
    visible?: boolean;
    opacity?: number;
    extent: number[] | undefined
};

export interface IMapLayerRenderer {
    setVisible(visible: boolean): void;
    setOpacity(opacity: number): void;
    setZIndex(setZIndex: number): void;
    setExtent(extent: number[] | null | undefined): void;
    destroy(): void;
}

export interface IMapLayerRendererConfigDefinitions {

}
