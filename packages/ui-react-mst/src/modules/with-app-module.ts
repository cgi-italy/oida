import { types, SnapshotIn, Instance, IModelType } from 'mobx-state-tree';

import { AppModule, AppModuleProps, AppModuleOthers } from './app-module';
import { inject } from '../utils/inject';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const withAppModule = <PROPS extends AppModuleProps, OTHERS extends AppModuleOthers, CONFIG>
(
    appModule: AppModule<IModelType<PROPS, OTHERS>, CONFIG>,
    config: CONFIG,
    initialState?: Partial<Omit<SnapshotIn<IModelType<PROPS, OTHERS>>, 'id'>>
) => {

    let initState: any = Object.assign({}, appModule.defaultInitState, initialState);

    return types.model({
        [appModule.defaultInitState.id!]: types.optional(appModule.stateModel, initState)
    })
    .extend((self) => {
        return {
            actions: {
                afterCreate: () => {
                    (self[appModule.defaultInitState.id!]).setConfig(config);
                }
            }
        };
    });
};


export const getAppModuleState =
<PROPS extends AppModuleProps, OTHERS extends AppModuleOthers, CONFIG>
(appModule: AppModule<IModelType<PROPS, OTHERS>, CONFIG>, appState: any) => {
    return appState[appModule.defaultInitState.id] as Instance<IModelType<PROPS, OTHERS>>;
};

export type ModuleStateSelector
<PROPS extends AppModuleProps, OTHERS extends AppModuleOthers, T extends Object> =
(moduleState: Instance< IModelType<PROPS, OTHERS>>) => T;

export type ModuleConfigSelector<CONFIG, T extends Object> = (moduleConfig: CONFIG) => T;

export const injectFromModuleState =
<PROPS extends AppModuleProps, OTHERS extends AppModuleOthers, CONFIG, T extends Object>
(appModule: AppModule<IModelType<PROPS, OTHERS>, CONFIG>, selector: ModuleStateSelector<PROPS, OTHERS, T>) => inject(({appState}) => {
    return selector(getAppModuleState(appModule, appState));
});

export const injectFromModuleConfig = <PROPS extends AppModuleProps, OTHERS extends AppModuleOthers, CONFIG, T extends Object>
(appModule: AppModule<IModelType<PROPS, OTHERS>, CONFIG>, selector: ModuleConfigSelector<CONFIG, T>) => inject(({appState}) => {
    return selector(getAppModuleState(appModule, appState).config);
});
