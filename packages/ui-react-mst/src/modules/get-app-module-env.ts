import { getParentOfType, Instance, typecheck, ModelInstanceType } from 'mobx-state-tree';

import { AppModule } from './app-module';

export const getAppModuleEnv = (self: Instance<any>) => {
    try {
        typecheck(AppModule, self);
        return self.env;
    } catch (e) {
        let moduleState = getParentOfType(self, AppModule);
        if (moduleState) {
            return moduleState.env as any;
        }
    }
};
