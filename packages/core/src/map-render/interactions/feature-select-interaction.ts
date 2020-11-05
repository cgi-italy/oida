import { IMapInteractionImplementation, IMMapInteractionProps } from './map-interaction-implementation';
import { IMapRenderer } from '../map/map-renderer';
import { SelectionMode } from '../../types/selection-mode';

export const FEATURE_SELECT_INTERACTION_ID = 'featureselect';

export type IFeatureSelectInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    onFeatureSelect: (selected: {
        featureId?: string,
        data?: any,
        mode: SelectionMode
    }) => void
} & IMMapInteractionProps<T>;

export interface IFeatureSelectInteractionImplementation extends IMapInteractionImplementation {
    setMultiple: (boolean) => void;
}
