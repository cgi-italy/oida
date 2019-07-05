import { types, Instance } from 'mobx-state-tree';

import { AppModule, AppModuleStateModel } from '../app-module';
import { Section } from './types';

export const DynamicLayoutStateModel = AppModuleStateModel.addModel(
    types.model('DynamicLayoutModule', {
        sections: types.map(Section)
    })
    .actions((self) => ({
        addSection: (id: string) => {
            let section = Section.create({id});
            self.sections.put(section);
            return section;
        }
    }))
    .views((self) => ({
        getOrCreateSection : (sectionId: string) => {
            if (!self.sections.has(sectionId)) {
                self.addSection(sectionId);
            }
            return self.sections.get(sectionId)!;
        }
    }))
);

export type DynamicLayoutModuleConfig = {
};

export type DynamicLayoutModule = AppModule<typeof DynamicLayoutStateModel, DynamicLayoutModuleConfig>;
export const DefaultDynamicLayoutModule: DynamicLayoutModule = {
    stateModel: DynamicLayoutStateModel,
    defaultInitState: {
        id: 'dynamicLayout',
        sections: {}
    }
};

export type IDynamicLayoutStateModel = Instance<typeof DynamicLayoutStateModel>;
