import { useAppModule } from '../../use-app-module';
import { BreadcrumbModule, DEFAULT_BREADCRUMB_MODULE_ID } from '../breadcrumb-module';

export const useBreadcrumbModule = (id?: string) => {
    return useAppModule(id || DEFAULT_BREADCRUMB_MODULE_ID, BreadcrumbModule);
};
