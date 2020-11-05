import { useMapModule } from './use-map-module';

export const useMapSelection = (mapModuleId?: string) => {
    let moduleState = useMapModule(mapModuleId);
    return moduleState.selectionManager;
};

