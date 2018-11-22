import { IMapInteractionImplementation } from './map-interaction-implementation';
import { IMapRenderer } from '../map/map-renderer';

export const MOUSE_COORDS_INTERACTION_ID = 'mousecoords';

export type IMouseCoordsInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    mapRenderer: T;
    onMouseCoords: (coords: any) => void
};

export interface IMouseCoordsInteraction extends IMapInteractionImplementation {

}
