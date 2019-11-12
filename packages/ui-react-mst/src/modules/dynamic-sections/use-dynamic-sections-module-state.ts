import { useAppModuleState } from '../use-app-module-state';
import { DynamicSectionsModule, DefaultDynamicSectionsModule } from './dynamic-sections-module';

export const useDynamicSectionsModuleState = (dynamicSectionsModule: DynamicSectionsModule = DefaultDynamicSectionsModule) => {
    return useAppModuleState(dynamicSectionsModule);
};

