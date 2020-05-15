import { types, Instance } from 'mobx-state-tree';

import { Omit } from '@oida/core';
import { hasConfig } from '@oida/state-mst';
import { LayoutSectionItem } from '@oida/ui-react-core';

const SectionItemDecl = types.compose(
    'SectionItem',
    types.model({
        id: types.identifier,
    }),
    hasConfig<Omit<LayoutSectionItem, 'id'>>()
).views((self) => ({
    get renderingConfig() {
        return {
            id: self.id,
            ...self.config
        };
    }
}));


type SectionItemType = typeof SectionItemDecl;
export interface SectionItemInterface extends SectionItemType {}
export const SectionItem: SectionItemInterface = SectionItemDecl;
export interface ISectionItem extends Instance<SectionItemInterface> {}
