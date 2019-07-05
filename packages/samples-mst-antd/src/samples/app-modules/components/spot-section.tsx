import React, { useMemo } from 'react';

import { Icon } from 'antd';

import { BreadcrumbItem, DynamicSectionInjector } from '@oida/ui-react-mst';

import { FilterSection } from './filter-section';

export const SpotSection = () => {

    let filters = useMemo(() => <FilterSection/>, []);

    return (
        <React.Fragment>
            <BreadcrumbItem
                data={{
                    key: 'spots',
                    title: 'Spots',
                    link: '/appModules/spots'
                }}
            />
            <DynamicSectionInjector
                sectionId='sidebar'
                id='filters'
                title='Filters'
                icon={(<Icon type='smile'></Icon>)}
            >
                 {filters}
            </DynamicSectionInjector>
        </React.Fragment>
    );

};
