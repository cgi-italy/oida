import { ILayerRenderer } from '../layers/map-layer-renderer';
import { IGroupLayerRenderer } from '../layers/group-layer-renderer';

export interface IMapProjection {
    code: string;
    projDef?: string;
    extent?: [number, number, number, number];
    wrapX?: boolean;
}

export interface IMapViewport {
    resolution: number;
    center: [number, number];
    rotation?: number;
    pitch?: number;
}

export interface IMapRendererProps {
    projection: IMapProjection;
    viewport: IMapViewport;
    target?: HTMLElement;
    onViewUpdating?: (viewport?: IMapViewport) => void;
    onViewUpdated?: (viewport?: IMapViewport) => void;
}

export interface IMapRenderer {

    setTarget(target: HTMLElement): void;
    setViewport(viewport: IMapViewport): void;
    setLayerGroup(group: IGroupLayerRenderer);
    getSize(): [number, number];
    destroy(): void;
}

export type IMapRendererContructor = {
    new(props: IMapRendererProps): IMapRenderer
};
