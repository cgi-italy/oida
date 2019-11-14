import { types, Instance, SnapshotIn } from 'mobx-state-tree';

import { ExtractPropsFromModel, ExtractOthersFromModel, TaggedUnion, needsConfig } from '@oida/state-mst';

const AppModuleStateModelBase = types.compose(
    'AppModule',
    types.model({
        id: types.identifier
    }),
    needsConfig<any>()
);


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
