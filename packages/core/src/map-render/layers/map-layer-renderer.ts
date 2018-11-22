export interface ILayerRenderer {
    setVisible(visible: boolean): void;
    setOpacity(opacity: number): void;
    destroy(): void;
}
