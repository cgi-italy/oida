import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { EnumFeaturePropertyDescriptor, DiscreteColorMap } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

export type DatasetDiscreteColorMapEditorProps = {
    enumColorMap: DiscreteColorMap;
    enumProperty: EnumFeaturePropertyDescriptor;
};

export const DatasetDiscreteColorMapEditor = (props: DatasetDiscreteColorMapEditorProps) => {
    const enumColorMap = useSelector(() => {
        return props.enumColorMap.mapItems;
    }, [props.enumColorMap]);
    const LegendItems = Object.entries(enumColorMap).map((colorProps) => {
        const option = props.enumProperty.options.find((option) => option.value === colorProps[0]);
        return (
            <div key={colorProps[0]} className='enum-legend-element'>
                <input
                    className='enum-legend-element-color-picker'
                    type='color'
                    value={colorProps[1]}
                    onChange={(value) => {
                        props.enumColorMap.setColorMapItemColor(colorProps[0], value.target.value);
                    }}
                />
                <span className='enum-legend-element-description'>{option?.name || colorProps[0]}</span>
                {option?.description && (
                    <div className='enum-legend-description-tooltip'>
                        <Tooltip placement='right' title={option.description}>
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                )}
            </div>
        );
    });
    return <div className='dataset-discrete-colormap-editor'> {LegendItems} </div>;
};
