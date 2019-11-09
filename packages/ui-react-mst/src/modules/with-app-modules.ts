import { types, SnapshotIn, Instance, IModelType, typecheck } from 'mobx-state-tree';

import { Omit } from '@oida/core';

import { AppModule, AppModuleStateModel, AppModuleProps, AppModuleOthers } from './app-module';

export const withAppModules = types.model({
    modules: types.late(() => types.map(AppModuleStateModel.Type))
}).actions((self) => ({
    addModule: <PROPS extends AppModuleProps, OTHERS extends AppModuleOthers, CONFIG>(
        appModule: AppModule<IModelType<PROPS, OTHERS>, CONFIG>,
        config: CONFIG,
        initialState?: Partial<Omit<SnapshotIn<IModelType<PROPS, OTHERS>>, 'id'>>
    ) => {
        let initState = {
            ...appModule.defaultInitState,
            ...initialState
        };

        let appModuleState = appModule.stateModel.create(initState);
        appModuleState.setConfig(config);

        self.modules.put(appModuleState);

        return appModuleState;
    }
})).views((self) => ({
    getModuleState: <PROPS extends AppModuleProps, OTHERS extends AppModuleOthers, CONFIG>(
        appModule: AppModule<IModelType<PROPS, OTHERS>, CONFIG>
    ) => {
        let moduleState = self.modules.get(appModule.defaultInitState.id!);
        //@ts-ignore
        typecheck(appModule.stateModel, moduleState);
        return self.modules.get(appModule.defaultInitState.id!) as Instance<IModelType<PROPS, {
            config: CONFIG;
        } & OTHERS>>;
    }
}));

export type IAppWithModules = Instance<typeof withAppModules>;