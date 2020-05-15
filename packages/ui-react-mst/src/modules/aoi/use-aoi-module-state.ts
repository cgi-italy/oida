import { useAppModuleState } from '../use-app-module-state';
import { AoiModule, DefaultAoiModule } from './aoi-module';

export const useAoiModuleState = (aoiModule: AoiModule = DefaultAoiModule) => {
    return useAppModuleState(aoiModule);
};

type AoiModuleStateType = ReturnType<typeof useAoiModuleState>;
export interface IAoiModuleState extends AoiModuleStateType {}
