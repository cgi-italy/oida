import { useAppModuleState } from '../use-app-module-state';
import { BreadcrumbModule, DefaultBreadcrumbModule } from './breadcrumb-module';

export const useBreadcrumbModuleState = (breadcrumbModule: BreadcrumbModule = DefaultBreadcrumbModule) => {
    return useAppModuleState(breadcrumbModule);
};

