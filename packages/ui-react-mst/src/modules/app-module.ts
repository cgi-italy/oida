import { types, Instance, ModelProperties, IModelType, SnapshotIn } from 'mobx-state-tree';

import { TaggedUnion } from '@oida/state-mst';

const AppModuleStateModelBase = types.model(
    'AppModule',
    {
        id: types.identifier
    }
).volatile((self) => {
    return {
        config: {} as any
    };
}).actions((self) => {
    return {
        setConfig: (config) => {
            self.config = config;
        }
    };
});

export const AppModuleStateModel = TaggedUnion('appModuleType', AppModuleStateModelBase);

const AppModuleBase = AppModuleStateModel.addModel(types.model('AppModule', {}));
export type AppModuleStateModelType = typeof AppModuleBase;

export type AppModule<STATE_MODEL extends AppModuleStateModelType, CONFIG> = {
    stateModel: STATE_MODEL;
    defaultInitState: SnapshotIn<STATE_MODEL>
};

export type IAppModuleStateModel = Instance<typeof AppModuleBase>;
