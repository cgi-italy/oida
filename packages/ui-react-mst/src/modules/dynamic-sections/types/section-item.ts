import { types, Instance } from 'mobx-state-tree';

import { hasConfig } from '@oida/state-mst';
import { LayoutSectionItem } from '@oida/ui-react-core';

export type SectionItemConfig = Omit<LayoutSectionItem, 'id'>;

const SectionItemDecl = types.compose(
    'SectionItem',
    types.model({
        id: types.identifier,
    }),
    hasConfig<SectionItemConfig>()
).views((self) => ({
    get renderingConfig() {
        return {
            id: self.id,
            title: self.config.title,
            icon: self.config.icon,
            content: self.config.content
        };
    }
})).actions((self) => {
    return {
        updateItem: (item: SectionItemConfig) => {
            self.config = item;
        }
    };
});


type SectionItemType = typeof SectionItemDecl;
export interface SectionItemInterface extends SectionItemType {}
export const SectionItem: SectionItemInterface = SectionItemDecl;
export interface ISectionItem extends Instance<SectionItemInterface> {}
