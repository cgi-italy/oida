export interface ILayerRenderer {
    setVisible(visible: boolean): void;
    setOpacity(opacity: number): void;
    setZIndex(setZIndex: number): void;
    destroy(): void;
}
