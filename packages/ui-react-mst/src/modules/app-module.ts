import { types, Instance, IAnyModelType, ModelProperties, IModelType } from 'mobx-state-tree';

import { TaggedUnion } from '@oida/state-mst';

const AppModuleBase = types.model(
    'AppModule',
    {
        id: types.identifier
    }
).volatile((self) => {
    return {
        env: {},
        config: {}
    };
}).actions((self) => {
    return {
        setConfig: (config: Object) => {
            self.config = config;
        }
    };
});

export const AppModule = TaggedUnion('appModuleType', AppModuleBase);


export const registerAppModule = <PROPS extends ModelProperties, OTHERS>
(moduleModel: IModelType<PROPS, OTHERS>, defaultId: string, initEnv?: (config) => any) => {
    let model = moduleModel;

    if (initEnv) {
        model = moduleModel.actions((self) => {
            return {
                afterAttach: () => {
                    self.env = initEnv(self.config);
                }
            };
        });
    }

    return AppModule.addModel(model.named(defaultId));
};
