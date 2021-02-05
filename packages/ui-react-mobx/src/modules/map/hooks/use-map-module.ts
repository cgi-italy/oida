import { useAppModule, getAppModule } from '../../use-app-module';
import { MapModule, DEFAULT_MAP_MODULE_ID } from '../map-module';

export const useMapModule = (id?: string) => {
    return useAppModule<MapModule>(id || DEFAULT_MAP_MODULE_ID, MapModule);
};

export const getMapModule = (id?: string) => {
    return getAppModule<MapModule>(id || DEFAULT_MAP_MODULE_ID, MapModule);
};
