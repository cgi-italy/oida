import { useAppModuleState } from '../use-app-module-state';
import { DynamicLayoutModule, DefaultDynamicLayoutModule } from './dynamic-layout-module';

export const useDynamicLayoutModuleState = (dynamicLayoutModule: DynamicLayoutModule = DefaultDynamicLayoutModule) => {
    return useAppModuleState(dynamicLayoutModule);
};

