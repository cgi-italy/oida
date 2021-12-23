import { IDynamicFactory } from '../../utils/dynamic-factory';
import { IMapInteractionImplementation } from '../interactions/map-interaction-implementation';
import { IMapLayerRenderer, IMapLayerRendererConfigDefinitions } from '../layers/map-layer-renderer';
import { IGroupLayerRenderer } from '../layers/group-layer-renderer';

export type BBox = [number, number, number, number];

export interface IMapProjection {
    code: string;
    projDef?: string;
    extent?: BBox;
    wrapX?: boolean;
}

export type MapCoord = [number, number, number?];

export interface IMapViewport {
    resolution: number;
    center: MapCoord;
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

export type Size = [number, number];

export interface IMapRenderer {
    id: string;
    setTarget(target: HTMLElement): void;
    setViewport(viewport: IMapViewport, animate?: boolean): void;
    updateRendererProps(props: Record<string, any>): void;
    fitExtent(extent: BBox, animate?: boolean): void;
    getViewportExtent(): BBox;
    getLayersFactory(): IDynamicFactory<IMapLayerRenderer, IMapLayerRendererConfigDefinitions>;
    getInteractionsFactory(): IDynamicFactory<IMapInteractionImplementation>;
    setLayerGroup(group: IGroupLayerRenderer);
    getSize(): Size;
    updateSize(): void;
    destroy(): void;
}

export type IMapRendererContructor = {
    new (props: IMapRendererProps): IMapRenderer;
};
