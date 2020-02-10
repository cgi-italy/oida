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


export type AppModule<STATE_MODEL, CONFIG> = {
    stateModel: STATE_MODEL;
    defaultInitState: SnapshotIn<STATE_MODEL>
};

type AppModuleStateModelType = typeof AppModuleStateModel.Type;
export interface AppModuleStateModelInterface extends AppModuleStateModelType {}
export const AppModuleStateModelType: AppModuleStateModelInterface = AppModuleStateModel.Type;
export interface IAppModuleStateModel extends Instance<AppModuleStateModelInterface> {}


const AppModuleBase = AppModuleStateModel.addModel(types.model('AppModule', {}));
type AppModuleBaseType = typeof AppModuleBase;
export interface AppModuleBaseInterface extends AppModuleBaseType {}
export type AppModuleProps = ExtractPropsFromModel<AppModuleBaseInterface>;
export type AppModuleOthers = ExtractOthersFromModel<AppModuleBaseInterface>;
