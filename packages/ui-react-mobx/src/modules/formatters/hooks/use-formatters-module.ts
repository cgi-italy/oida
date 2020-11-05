import { useAppModule } from '../../use-app-module';
import { FormattersModule, DEFAULT_FORMATTERS_MODULE_ID } from '../formatters-module';

export const useFormattersModule = (id?: string) => {
    return useAppModule(id || DEFAULT_FORMATTERS_MODULE_ID, FormattersModule);
};

