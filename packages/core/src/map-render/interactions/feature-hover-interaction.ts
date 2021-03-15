import { IMapRenderer } from '../map/map-renderer';
import { IFeature } from '../layers/feature-layer-renderer';
import { IMapInteractionImplementation, IMMapInteractionProps } from './map-interaction-implementation';


export const FEATURE_HOVER_INTERACTION_ID = 'featurehover';

export type IFeatureHoverInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    onFeatureHover: (hovered: IFeature | undefined) => void
} & IMMapInteractionProps<T>;

export interface IFeatureHoverInteractionImplementation extends IMapInteractionImplementation {

}
