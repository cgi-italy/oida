import React from 'react';

import { SideBar } from '@oida/ui-react-antd';
import { useDynamicLayoutSection } from '@oida/ui-react-mst';

export const SideSection = () => {

    let dynamicSectionProps = useDynamicLayoutSection({sectionId: 'sidebar'});

    return (
        <SideBar
            {...dynamicSectionProps}
        />
    );
};
