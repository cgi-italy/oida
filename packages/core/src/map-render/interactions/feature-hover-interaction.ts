import { IMapInteractionImplementation, IMMapInteractionProps } from './map-interaction-implementation';
import { IMapRenderer } from '../map/map-renderer';

export const FEATURE_HOVER_INTERACTION_ID = 'featurehover';

export type IFeatureHoverInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    onFeatureHover: (featureId: string) => void
} & IMMapInteractionProps<T>;

export interface IFeatureHoverInteractionImplementation extends IMapInteractionImplementation {

}
