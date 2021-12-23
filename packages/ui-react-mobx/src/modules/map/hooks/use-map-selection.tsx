import { useMapModule } from './use-map-module';

export const useMapSelection = (mapModuleId?: string) => {
    const moduleState = useMapModule(mapModuleId);
    return moduleState.selectionManager;
};
