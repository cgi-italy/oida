import { types, Instance } from 'mobx-state-tree';

import { AppModule, AppModuleStateModel } from '../app-module';
import { Section } from './types';

export const DynamicSectionsStateModel = AppModuleStateModel.addModel(
    types.model('DynamicSectionsModule', {
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

export type DynamicSectionsModuleConfig = {
};

export type DynamicSectionsModule = AppModule<typeof DynamicSectionsStateModel, DynamicSectionsModuleConfig>;

export const DefaultDynamicSectionsModule: DynamicSectionsModule = {
    stateModel: DynamicSectionsStateModel,
    defaultInitState: {
        id: 'dynamicSections',
        sections: {}
    }
};

export type IDynamicSectionsStateModel = Instance<typeof DynamicSectionsStateModel>;
