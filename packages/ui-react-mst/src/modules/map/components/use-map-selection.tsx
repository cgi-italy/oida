import { useMapModuleState } from '../use-map-module-state';

export const useMapSelection = (mapModule?) => {
    let moduleState = useMapModuleState(mapModule);
    return moduleState.selection;
};

