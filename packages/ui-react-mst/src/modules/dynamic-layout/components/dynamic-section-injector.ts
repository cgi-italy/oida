import { useEffect, useState } from 'react';

import { Omit } from '@oida/core';

import { IDynamicLayoutStateModel } from '../dynamic-layout-module';
import { useDynamicLayoutModuleState } from '../use-dynamic-layout-state-model';
import { ISectionItem, LayoutOptions } from '../types';

export type DynamicSectionInjectorProps = {
    dynamicSectionModule: IDynamicLayoutStateModel,
    sectionId: string,
    layoutOptions?: LayoutOptions,
    id: string,
    title: React.ReactNode,
    icon?: React.ReactNode,
    children: React.ReactNode,
};

const DynamicSectionInjectorBase = (props: DynamicSectionInjectorProps) => {

    let {dynamicSectionModule, sectionId, id, layoutOptions, children, ...renderProps} = props;

    let section = dynamicSectionModule.getOrCreateSection(sectionId)!;
    let [sectionItem, setSectionItem] = useState<ISectionItem | undefined>(undefined);

    useEffect(() => {
        let component = section.addComponent(id, {...renderProps, content: children}, layoutOptions);
        setSectionItem(component);

        return () => {
            section.removeComponent(component);
            setSectionItem(undefined);
        };
    }, [sectionId, dynamicSectionModule]);

    useEffect(() => {
        if (sectionItem) {
            sectionItem.setRenderingConfig({...renderProps, content: children});
        }
    }, [renderProps.title, renderProps.icon, children]);

    return null;
};


export const DynamicSectionInjector = (props: Omit<DynamicSectionInjectorProps, 'dynamicSectionModule'>) => {
    const dynamicSectionModule = useDynamicLayoutModuleState();

    return DynamicSectionInjectorBase({
        dynamicSectionModule,
        ...props
    });
};
