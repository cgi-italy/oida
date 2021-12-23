import React from 'react';
import { Checkbox, Select } from 'antd';

import { DatasetVectorMapViz, NumericFeaturePropertyDescriptor, NUMERIC_FEATURE_PROPERTY_TYPE, VECTOR_VIZ_TYPE } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetColorMapSelector } from './dataset-colormap-selector';
import { DatasetVectorVizFilters } from './dataset-vector-viz-filters';

export type DatasetVectorVizSettingsProps = {
    datasetViz: DatasetVectorMapViz;
};

export const DatasetVectorVizSettings = (props: DatasetVectorVizSettingsProps) => {
    const numericProperties = useSelector(() => {
        return props.datasetViz.featureDescriptor?.properties.filter((property) => {
            return property.type === NUMERIC_FEATURE_PROPERTY_TYPE;
        }) as NumericFeaturePropertyDescriptor[] | undefined;
    });

    const colorMap = useSelector(() => props.datasetViz.colorMap);
    const colorProperty = useSelector(() => {
        if (props.datasetViz.colorProperty) {
            return numericProperties?.find((property) => property.id === props.datasetViz.colorProperty);
        } else {
            return undefined;
        }
    }, [numericProperties]);

    return (
        <div className='dataset-vector-viz-settings'>
            <DatasetVectorVizFilters dataset={props.datasetViz} />
            {numericProperties?.length && props.datasetViz.config.colorScales?.length && (
                <div className='dataset-vector-viz-colormap'>
                    <Checkbox
                        checked={!!colorProperty}
                        onChange={(evt) => {
                            if (evt.target.checked) {
                                props.datasetViz.setColorProperty(numericProperties[0].id);
                            } else {
                                props.datasetViz.setColorProperty(undefined);
                            }
                        }}
                    >
                        Dynamic coloring
                    </Checkbox>
                    {colorProperty && (
                        <div className='dataset-combo-selector'>
                            <span>Property: </span>
                            <Select
                                value={colorProperty.id}
                                onChange={(value) => props.datasetViz.setColorProperty(value)}
                                options={numericProperties.map((property) => {
                                    return {
                                        label: property.name,
                                        value: property.id,
                                        title: property.description
                                    };
                                })}
                            />
                        </div>
                    )}
                    {colorProperty && colorMap && (
                        <DatasetColorMapSelector
                            colorMap={colorMap}
                            colorScales={props.datasetViz.config.colorScales}
                            variable={colorProperty}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

DatasetVizSettingsFactory.register(VECTOR_VIZ_TYPE, (config) => {
    return <DatasetVectorVizSettings {...config} />;
});
