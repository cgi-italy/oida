import { createDynamicFactory } from '../../utils';
import { IMapRenderer, IMapRendererProps } from './map-renderer';

export interface IMapRendererPropsDefinitions {}
export type IMapRendererTypes = keyof IMapRendererPropsDefinitions;

export const mapRendererFactory = createDynamicFactory<IMapRenderer, IMapRendererPropsDefinitions, IMapRendererProps>('map');
