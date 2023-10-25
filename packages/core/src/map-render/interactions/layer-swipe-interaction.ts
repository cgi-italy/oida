import { IMapLayerRenderer } from '../layers';
import { IMapRenderer } from '../map';
import { IMapInteractionImplementation, IMMapInteractionProps } from './map-interaction-implementation';

export const LAYER_SWIPE_INTERACTION_ID = 'layer_swipe';

export type ILayerSwipeInteractionProps<T extends IMapRenderer = IMapRenderer> = {
    swipePosition: number;
    targetLayer: IMapLayerRenderer | undefined;
    onSwipePositionChange: (swipePosition: number) => void;
} & IMMapInteractionProps<T>;

export interface ILayerSwipeInteractionImplementation extends IMapInteractionImplementation {
    setTargetLayer: (layer: IMapLayerRenderer | undefined) => void;
    setSwipePosition: (position: number) => void;
    getSupportedLayerTypes: () => string[];
}
