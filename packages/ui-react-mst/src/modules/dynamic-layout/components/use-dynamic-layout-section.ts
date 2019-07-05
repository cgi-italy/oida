import { useObserver } from 'mobx-react-lite';

import { Omit } from '@oida/core';

import { IDynamicLayoutStateModel } from '../dynamic-layout-module';
import { useDynamicLayoutModuleState } from '../use-dynamic-layout-state-model';

export type DynamicSectionProps = {
    dynamicSectionModule: IDynamicLayoutStateModel,
    sectionId: string
};

const useDynamicLayoutSectionBase = ({dynamicSectionModule, sectionId}: DynamicSectionProps) => {

    let section = dynamicSectionModule.getOrCreateSection(sectionId);

    return useObserver(() => ({
        components: section.components.map((component) => component.renderingConfig),
        activeComponent: section.activeComponent ? section.activeComponent.id : undefined,
        showComponent: (componentId?: string) => {
            section.setActiveComponent(componentId);
        }
    }));
};

export const useDynamicLayoutSection = (props: Omit<DynamicSectionProps, 'dynamicSectionModule'>) => {
    const dynamicSectionModule = useDynamicLayoutModuleState();

    return useDynamicLayoutSectionBase({
        dynamicSectionModule,
        ...props
    });
};
