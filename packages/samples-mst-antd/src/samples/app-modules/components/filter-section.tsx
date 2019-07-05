import React, { useState } from 'react';

import { DataFilterer } from '@oida/ui-react-antd';
import { useMapAoiDrawerFromModule } from '@oida/ui-react-mst';


let filters = [
    {
        name: 'AOI',
        title: 'Aoi',
        type: 'aoi',
        config: (state) => useMapAoiDrawerFromModule(state)
    },
    {
        name: 'text',
        title: 'Text',
        type: 'string',
        config: {}
    }
];

export const FilterSection = () => {

    let [values, setFilterValues] = useState(new Map());

    const onFilterChange = (name: string, value: string) => {
        let newValues = new Map(values);
        newValues.set(name, value);
        setFilterValues(newValues);
    };


    return (
        <DataFilterer
            onFilterChange={onFilterChange}
            filters={filters}
            values={values}
        ></DataFilterer>
    );
};

