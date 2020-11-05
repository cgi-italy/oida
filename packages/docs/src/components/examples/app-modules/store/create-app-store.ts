import { HasAppModules, AppModules } from '@oida/ui-react-mobx';

import { initMapModule } from './init-map-module';
import { initFormattersModule } from './init-formatters-module';

export class AppState implements HasAppModules {
    readonly modules: AppModules;

    constructor() {
        this.modules = new AppModules();
    }
}

export const createAppStore = () => {
    const appState = new AppState();

    const mapModule = initMapModule();
    appState.modules.addModule(mapModule);

    const formattersModule = initFormattersModule();
    appState.modules.addModule(formattersModule);

    return appState;
};

