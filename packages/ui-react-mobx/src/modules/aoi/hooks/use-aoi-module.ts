import { useAppModule } from '../../use-app-module';
import { AoiModule, DEFAULT_AOI_MODULE_ID } from '../aoi-module';

export const useAoiModule = (id?: string) => {
    return useAppModule<AoiModule>(id || DEFAULT_AOI_MODULE_ID, AoiModule);
};
