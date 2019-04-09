import { types, SnapshotIn, Instance, } from 'mobx-state-tree';

import { AppModule, AppModuleStateModelType } from './app-module';
import { inject } from '../utils/inject';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const withAppModule = <STATE_MODEL extends AppModuleStateModelType, CONFIG>
(appModule: AppModule<STATE_MODEL, CONFIG>, config: CONFIG, initialState?: Partial<Omit<SnapshotIn<STATE_MODEL>, 'id'>>) => {

    let initState: any = Object.assign({}, appModule.defaultInitState, initialState);

    return types.model({
        [appModule.defaultInitState.id]: types.optional(appModule.stateModel, initState)
    })
    .extend((self) => {
        return {
            actions: {
                afterCreate: () => {
                    (self[appModule.defaultInitState.id]).setConfig(config);
                }
            }
        };
    });
};


export const getAppModuleState = <STATE_MODEL extends AppModuleStateModelType, CONFIG>
(appModule: AppModule<STATE_MODEL, CONFIG>, appState) => {
    return appState[appModule.defaultInitState.id] as Instance<STATE_MODEL>;
};

export type ModuleStateSelector<STATE_MODEL extends AppModuleStateModelType, T extends Object> = (moduleState: Instance<STATE_MODEL>) => T;
export type ModuleConfigSelector<CONFIG, T extends Object> = (moduleConfig: CONFIG) => T;

export const injectFromModuleState = <STATE_MODEL extends AppModuleStateModelType, CONFIG, T extends Object>
(appModule: AppModule<STATE_MODEL, CONFIG>, selector: ModuleStateSelector<STATE_MODEL, T>) => inject(({appState}) => {
    return selector(getAppModuleState(appModule, appState));
});

export const injectFromModuleConfig = <STATE_MODEL extends AppModuleStateModelType, CONFIG, T extends Object>
(appModule: AppModule<STATE_MODEL, CONFIG>, selector: ModuleConfigSelector<CONFIG, T>) => inject(({appState}) => {
    return selector(getAppModuleState(appModule, appState).config);
});
