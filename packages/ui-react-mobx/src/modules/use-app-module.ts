import React, { useContext } from 'react';

import { AppModule, HasAppModules } from './app-module';

let appStoreContext;

export const createAppStoreContext = <APP_STATE extends HasAppModules>(appState: APP_STATE) => {
    if (appStoreContext) {
        throw new Error('createAppStoreContext should be called once');
    }
    appStoreContext = React.createContext(appState);
    return appStoreContext as React.Context<APP_STATE>;
};

export const destroyAppStoreContext = () => {
    appStoreContext = undefined;
};

export const useAppStore = <APP_STATE extends HasAppModules>() => {
    if (!appStoreContext) {
        throw new Error('No app store context created.');
    }
    return useContext(appStoreContext) as APP_STATE;
};

export const useAppModule = <M extends AppModule> (id: string, moduleCtor: new(...args: any[]) => M) => {
    let appStore = useAppStore<HasAppModules>();

    let module = appStore.modules.getModule(id);
    if (!(module instanceof moduleCtor)) {
        throw new Error(`useAppModule: no module of type ${moduleCtor.name} with id '${id}' found`);
    }
    return module as M;
};

export const getAppModule = <M extends AppModule> (id: string, moduleCtor: new(...args: any[]) => M) => {
    let appStore = appStoreContext._currentValue;

    let module = appStore.modules.getModule(id);
    if (!(module instanceof moduleCtor)) {
        throw new Error(`getAppModule: no module of type ${moduleCtor.name} with id '${id}' found`);
    }
    return module as M;
};
