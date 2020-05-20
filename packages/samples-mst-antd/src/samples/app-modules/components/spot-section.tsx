import React, { useMemo } from 'react';

import { SmileOutlined } from '@ant-design/icons';

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
                icon={(<SmileOutlined/>)}
            >
                 {filters}
            </DynamicSectionInjector>
        </React.Fragment>
    );

};
