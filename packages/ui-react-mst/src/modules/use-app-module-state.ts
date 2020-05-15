import React, { useContext } from 'react';

import { IModelType } from 'mobx-state-tree';
import { AppModule, AppModuleProps, AppModuleOthers } from './app-module';
import { IAppWithModules } from './with-app-modules';


let appStoreContext;

export const createAppStoreContext = <APP_STATE extends IAppWithModules>(appState: APP_STATE) => {
    if (appStoreContext) {
        throw new Error('createAppStoreContext should be called once');
    }
    appStoreContext = React.createContext(appState);
    return appStoreContext;
};

export const destroyAppStoreContext = () => {
    appStoreContext = undefined;
};

export const useAppStore = <T = any>() => {
    if (!appStoreContext) {
        throw new Error('No app store context created.');
    }
    return useContext(appStoreContext) as T;
};

export const useAppModuleState = <
    PROPS extends AppModuleProps,
    OTHERS extends AppModuleOthers,
    CONFIG
> (appModule: AppModule<IModelType<PROPS, OTHERS>, CONFIG>) => {
    let appStore = useAppStore<IAppWithModules>();

    return appStore.getModuleState(appModule);
};

