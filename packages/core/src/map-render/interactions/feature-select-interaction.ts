import { IMapRenderer } from '../map/map-renderer';
import { SelectionMode } from '../../common';
import { IFeature } from '../layers/feature-layer-renderer';
import { IMapInteractionImplementation, IMMapInteractionProps } from './map-interaction-implementation';

export const FEATURE_SELECT_INTERACTION_ID = 'featureselect';

export type FeatureSelectCallback = (selected: { feature: IFeature | undefined; mode: SelectionMode }) => void;

export type IFeatureSelectInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    onFeatureSelect: FeatureSelectCallback;
} & IMMapInteractionProps<T>;

export interface IFeatureSelectInteractionImplementation extends IMapInteractionImplementation {
    setMultiple: (boolean) => void;
}
