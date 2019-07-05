import { useAppModuleState } from '../use-app-module-state';
import { FormattersModule, DefaultFormattersModule } from './formatters-module';

export const useFormattersModuleState = (formattersModule: FormattersModule = DefaultFormattersModule) => {
    return useAppModuleState(formattersModule);
};

