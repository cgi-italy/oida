import { useAppModuleState } from '../use-app-module-state';
import { MapModule, DefaultMapModule } from './map-module';

export const useMapModuleState = (mapModule: MapModule = DefaultMapModule) => {
    return useAppModuleState(mapModule);
};

