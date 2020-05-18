import { useObserver } from 'mobx-react';

import { LayoutSectionProps } from '@oida/ui-react-core';

import { IDynamicSectionsStateModel } from '../dynamic-sections-module';
import { useDynamicSectionsModuleState } from '../use-dynamic-sections-module-state';

export type DynamicSectionProps = {
    dynamicSectionsModule: IDynamicSectionsStateModel,
    sectionId: string
};

const useDynamicSectionBase = ({dynamicSectionsModule, sectionId}: DynamicSectionProps) => {

    let section = dynamicSectionsModule.getOrCreateSection(sectionId);

    return useObserver(() => ({
        components: section.components.map((component) => component.renderingConfig),
        activeComponent: section.activeComponent ? section.activeComponent.id : undefined,
        showComponent: (componentId?: string) => {
            section.setActiveComponent(componentId);
        },
        expanded: section.expanded,
        setExpanded: (expanded: boolean) => {
            section.setExpanded(expanded);
        }
    })) as LayoutSectionProps;
};

export const useDynamicLayoutSection = (props: Omit<DynamicSectionProps, 'dynamicSectionsModule'>) => {
    const dynamicSectionsModule = useDynamicSectionsModuleState();

    return useDynamicSectionBase({
        dynamicSectionsModule,
        ...props
    });
};
