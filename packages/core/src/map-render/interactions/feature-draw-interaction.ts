import { IMapInteractionImplementation, IMMapInteractionProps } from './map-interaction-implementation';
import { IMapRenderer } from '../map/map-renderer';

export const FEATURE_DRAW_INTERACTION_ID = 'featuredraw';

export type IFeatureDrawInteractionProps<T extends IMapRenderer = IMapRenderer> = {

} & IMMapInteractionProps<T>;

export enum FeatureDrawMode {
    Off = 'OFF',
    Point = 'POINT',
    Line = 'LINE',
    BBox = 'BBOX',
    Polygon = 'POLYGON',
    Circle = 'CIRCLE',
    Edit = 'EDIT'
}


export type FeatureDrawEvent = {
    geometry: any
};

export type FeatureDrawOptions = {
    onDrawStart?: (evt: FeatureDrawEvent) => void;
    onDrawChange?: (evt: FeatureDrawEvent) => void;
    onDrawEnd?: (evt: FeatureDrawEvent) => void;
};

export interface IFeatureDrawInteractionImplementation extends IMapInteractionImplementation {
    setDrawMode: (mode: FeatureDrawMode, options) => void;
}
