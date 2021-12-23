import { IMapInteractionImplementation } from './map-interaction-implementation';
import { IMapRenderer } from '../map/map-renderer';

export const MOUSE_COORDS_INTERACTION_ID = 'mousecoords';

export type MouseCoords = {
    lat: number;
    lon: number;
};

export type IMouseCoordsInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    mapRenderer: T;
    onMouseCoords: (coords: MouseCoords | undefined) => void;
    onMouseClick: (coords: MouseCoords | undefined) => void;
};

export interface IMouseCoordsInteraction extends IMapInteractionImplementation {}
