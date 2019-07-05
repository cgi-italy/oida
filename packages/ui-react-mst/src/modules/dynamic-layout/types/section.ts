import { types } from 'mobx-state-tree';
import { SectionItem, ISectionItem, SectionItemRenderingConfig } from './section-item';

export type LayoutOptions = {
    idx?: number;
    show?: boolean;
};

export const Section = types.model('LayoutSection', {
    id: types.identifier,
    components: types.optional(types.array(SectionItem), []),
    activeComponent: types.safeReference(SectionItem)
}).actions((self) => ({
    addComponent: (id: string, renderingConfig: SectionItemRenderingConfig, options: LayoutOptions = {}) => {
        let component = SectionItem.create({id});
        component.setRenderingConfig(renderingConfig);

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
    }
}));
