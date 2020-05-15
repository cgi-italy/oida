import { types, SnapshotIn, Instance, IModelType, typecheck } from 'mobx-state-tree';

import { AppModule, AppModuleStateModelType, AppModuleProps, AppModuleOthers } from './app-module';

export const withAppModules = types.model({
    modules: types.late(() => types.map(AppModuleStateModelType))
}).actions((self) => ({
    addModule: <PROPS extends AppModuleProps, OTHERS extends AppModuleOthers>(
        appModule: AppModule<IModelType<PROPS, OTHERS>>,
        initialState?: Partial<Omit<SnapshotIn<IModelType<PROPS, OTHERS>>, 'id'>>
    ) => {

        let initState = {
            ...appModule.defaultInitState,
            ...initialState
        };

        let appModuleState = appModule.stateModel.create(initState);

        self.modules.put(appModuleState);

        return appModuleState;
    }
})).views((self) => ({
    getModuleState: <PROPS extends AppModuleProps, OTHERS extends AppModuleOthers>(
        appModule: AppModule<IModelType<PROPS, OTHERS>>
    ) => {
        let moduleState = self.modules.get(appModule.defaultInitState.id!);
        //@ts-ignore
        typecheck(appModule.stateModel, moduleState);

        return moduleState as Instance<IModelType<PROPS, OTHERS>>;
    }
}));

type AppWithModulesType = typeof withAppModules;
export interface AppWithModulesInterface extends AppWithModulesType {}
export type IAppWithModules = Instance<AppWithModulesInterface>;
