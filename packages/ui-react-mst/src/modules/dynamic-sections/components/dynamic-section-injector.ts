import { useEffect, useState } from 'react';

import { IDynamicSectionsStateModel } from '../dynamic-sections-module';
import { useDynamicSectionsModuleState } from '../use-dynamic-sections-module-state';
import { ISectionItem, LayoutOptions } from '../types';

export type DynamicSectionInjectorProps = {
    dynamicSectionsModule: IDynamicSectionsStateModel,
    sectionId: string,
    layoutOptions?: LayoutOptions,
    id: string,
    title: React.ReactNode,
    icon?: React.ReactNode,
    children: React.ReactNode,
};

const DynamicSectionInjectorBase = (props: DynamicSectionInjectorProps) => {

    let {dynamicSectionsModule, sectionId, id, layoutOptions, children, ...renderProps} = props;

    let section = dynamicSectionsModule.getOrCreateSection(sectionId)!;
    let [sectionItem, setSectionItem] = useState<ISectionItem | undefined>(undefined);

    useEffect(() => {
        let component = section.addComponent(id, {...renderProps, content: children}, layoutOptions);
        setSectionItem(component);

        return () => {
            section.removeComponent(component);
            setSectionItem(undefined);
        };
    }, [sectionId, dynamicSectionsModule]);

    useEffect(() => {
        if (sectionItem) {
            sectionItem.updateItem({
                ...renderProps,
                content: children
            });
        }
    }, [renderProps.title, renderProps.icon, children]);

    return null;
};


export const DynamicSectionInjector = (props: Omit<DynamicSectionInjectorProps, 'dynamicSectionsModule'>) => {
    const dynamicSectionsModule = useDynamicSectionsModuleState();

    return DynamicSectionInjectorBase({
        dynamicSectionsModule,
        ...props
    });
};
