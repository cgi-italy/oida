import { IMapRenderer } from '../map/map-renderer';

export type IMMapInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    mapRenderer: T;
};

export interface IMapInteractionImplementation {
    setActive(active: boolean): void;
    destroy(): void;
}
