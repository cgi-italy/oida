import { IMapInteractionImplementation, IMMapInteractionProps } from './map-interaction-implementation';
import { IMapRenderer } from '../map/map-renderer';

export const FEATURE_SELECT_INTERACTION_ID = 'featureselect';

export type IFeatureSelectInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    onFeatureSelect: (featureId: string) => void
} & IMMapInteractionProps<T>;

export interface IFeatureSelectInteractionImplementation extends IMapInteractionImplementation {
    setMultiple: (boolean) => void;
}
