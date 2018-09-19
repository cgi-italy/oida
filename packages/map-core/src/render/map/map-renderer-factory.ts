import { createDynamicFactory } from '../../utils/dynamic-factory';
import { IMapRenderer } from './map-renderer';

export const mapRendererFactory = createDynamicFactory<IMapRenderer>('map');
