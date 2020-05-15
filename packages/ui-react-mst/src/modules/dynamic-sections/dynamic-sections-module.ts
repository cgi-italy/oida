import { types, Instance } from 'mobx-state-tree';

import { AppModule, AppModuleStateModel } from '../app-module';
import { Section } from './types';

const DynamicSectionsStateModelDecl = AppModuleStateModel.addModel(
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

type DynamicSectionsStateModelType = typeof DynamicSectionsStateModelDecl;
export interface DynamicSectionsStateModelInterface extends DynamicSectionsStateModelType {}
export const DynamicSectionsStateModel: DynamicSectionsStateModelInterface = DynamicSectionsStateModelDecl;
export interface IDynamicSectionsStateModel extends Instance<DynamicSectionsStateModelInterface> {}

export type DynamicSectionsModule = AppModule<DynamicSectionsStateModelInterface>;

export const DefaultDynamicSectionsModule: DynamicSectionsModule = {
    stateModel: DynamicSectionsStateModel,
    defaultInitState: {
        id: 'dynamicSections',
        sections: {}
    }
};

