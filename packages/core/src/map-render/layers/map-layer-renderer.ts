export interface ILayerRenderer {
    setVisible(visible: boolean): void;
    setOpacity(opacity: number): void;
    setZIndex(setZIndex: number): void;
    setExtent(extent: number[] | null | undefined): void;
    destroy(): void;
}
