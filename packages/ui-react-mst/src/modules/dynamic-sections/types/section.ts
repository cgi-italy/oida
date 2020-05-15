import { types, Instance } from 'mobx-state-tree';

import { Omit } from '@oida/core';
import { LayoutSectionItem } from '@oida/ui-react-core';

import { SectionItem, ISectionItem } from './section-item';

export type LayoutOptions = {
    idx?: number;
    show?: boolean;
};

const SectionDecl = types.model('LayoutSection', {
    id: types.identifier,
    components: types.optional(types.array(SectionItem), []),
    activeComponent: types.safeReference(SectionItem),
    expanded: types.optional(types.boolean, true)
}).actions((self) => ({
    addComponent: (id: string, config: Omit<LayoutSectionItem, 'id'>, options: LayoutOptions = {}) => {
        let component = SectionItem.create({
            id,
            config: config
        });

        let { idx, show } = options;

        if (typeof(idx) === 'number' && idx < self.components.length) {
            self.components.splice(idx, 0, component);
        } else {
            self.components.push(component);
        }
        if (show) {
            self.activeComponent = component;
        }

        return component;
    },
    removeComponent: (component: ISectionItem) => {
        self.components.remove(component);
    },
    setActiveComponent: (componentId?: string) => {
        let component = componentId ? self.components.find((component) => {
            return component.id === componentId;
        }) : undefined;
        self.activeComponent = component;
    },
    setExpanded: (expanded: boolean) => {
        self.expanded = expanded;
    }
}));


type SectionType = typeof SectionDecl;
export interface SectionInterface extends SectionType {}
export const Section: SectionInterface = SectionDecl;
export interface ISection extends Instance<SectionInterface> {}
