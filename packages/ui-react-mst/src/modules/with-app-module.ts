import { types, OptionalDefaultValueOrFunction, SnapshotIn } from 'mobx-state-tree';

import { AppModule } from './app-module';

let BaseModule = AppModule.addModel(types.model('AppModule', {}));

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const withAppModule = <ID extends string, MODULE extends typeof BaseModule>
(moduleType: MODULE, id: ID, initialState?: Omit<SnapshotIn<MODULE>, 'id'>, config?) => {

    let initState: any = initialState || {};

    initState = {
        ...initState,
        id: id
    };

    return types.model({
        [id]: types.optional(moduleType, initState)
    })
    .extend((self) => {
        return {
            actions: {
                afterCreate: () => {
                    self[id].setConfig(config || {});
                }
            }
        };
    });
};
