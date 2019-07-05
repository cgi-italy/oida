import { types, Instance, ModelProperties, IModelType, IAnyModelType, ISimpleType, SnapshotIn } from 'mobx-state-tree';

import { ExtractPropsFromModel, ExtractOthersFromModel, TaggedUnion } from '@oida/state-mst';

const AppModuleStateModelBase = types.model(
    'AppModule',
    {
        id: types.identifier
    }
).volatile((self) => {
    return {
        config: undefined
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

export type AppModuleProps = ExtractPropsFromModel<AppModuleStateModelType>;
export type AppModuleOthers = ExtractOthersFromModel<AppModuleStateModelType>;

export type AppModule<STATE_MODEL, CONFIG> = {
    stateModel: STATE_MODEL;
    defaultInitState: SnapshotIn<STATE_MODEL>
};

export type IAppModuleStateModel = Instance<typeof AppModuleBase>;
