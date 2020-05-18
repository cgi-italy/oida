import React, { useState } from 'react';

import { AoiAction } from '@oida/core';
import { DataFilterer } from '@oida/ui-react-antd';
import { useMapAoiFieldFromModule } from '@oida/ui-react-mst';


let filters = [
    {
        name: 'AOI',
        title: 'Aoi',
        type: 'aoi',
        config: (state) => {
            let supportedGeometries = [{
                type: 'BBox'
            }, {
                type: 'Polygon'
            }];

            return {
                ...useMapAoiFieldFromModule({
                    ...state,
                    supportedGeometries: supportedGeometries
                }),
                supportedGeometries: supportedGeometries,
                supportedActions: [
                    AoiAction.DrawPoint,
                    AoiAction.DrawLine,
                    AoiAction.DrawBBox,
                    AoiAction.DrawPolygon,
                    AoiAction.Import,
                    AoiAction.LinkToMapViewport
                ],
            };
        }
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

