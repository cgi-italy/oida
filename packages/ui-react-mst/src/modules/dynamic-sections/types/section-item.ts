import { types, Instance } from 'mobx-state-tree';

import { Omit } from '@oida/core';
import { needsConfig } from '@oida/state-mst';
import { LayoutSectionItem } from '@oida/ui-react-core';

export const SectionItem = types.compose(
    'SectionItem',
    types.model({
        id: types.identifier,
    }),
    needsConfig<Omit<LayoutSectionItem, 'id'>>()
).views((self) => ({
    get renderingConfig() {
        return {
            id: self.id,
            ...self.config
        };
    }
}));

export type ISectionItem = Instance<typeof SectionItem>;
