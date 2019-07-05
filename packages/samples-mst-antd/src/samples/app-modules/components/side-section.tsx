import React from 'react';

import { SideBar } from '@oida/ui-react-antd';
import { useDynamicLayoutSection } from '@oida/ui-react-mst';

export const SideSection = () => {

    let {components, activeComponent, showComponent} = useDynamicLayoutSection({sectionId: 'sidebar'});

    return (
        <SideBar
            components={components}
            activeComponent={activeComponent}
            showComponent={showComponent}
        />
    );
};
