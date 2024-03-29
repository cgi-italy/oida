import React from 'react';
import { Checkbox, Select } from 'antd';

import { DatasetVectorMapViz, ENUM_FEATURE_PROPERTY_TYPE, NUMERIC_FEATURE_PROPERTY_TYPE, VECTOR_VIZ_TYPE } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetColorMapSelector } from './dataset-colormap-selector';
import { DatasetVectorVizFilters } from './dataset-vector-viz-filters';
import { DatasetDimensionValueSelector } from './dataset-dimension-value-selector';
import { DatasetDiscreteColorMapEditor } from './dataset-discrete-colormap-editor';
import { DatasetVizOpacityControl } from './dataset-viz-opacity-control';

export type DatasetVectorVizSettingsProps = {
    datasetViz: DatasetVectorMapViz;
};

export const DatasetVectorVizSettings = (props: DatasetVectorVizSettingsProps) => {
    let dimensionSelectors: JSX.Element[] | undefined;

    if (props.datasetViz.config.dimensions) {
        dimensionSelectors = props.datasetViz.config.dimensions.map((dimension) => {
            return <DatasetDimensionValueSelector dimensionsState={props.datasetViz.dimensions} dimension={dimension} key={dimension.id} />;
        });
    }

    const colorableProperties = useSelector(() => {
        return props.datasetViz.featureDescriptor?.properties.filter((property) => {
            return property.type === NUMERIC_FEATURE_PROPERTY_TYPE || property.type === ENUM_FEATURE_PROPERTY_TYPE;
        });
    });

    const colorProperty = useSelector(() => {
        if (props.datasetViz.colorProperty) {
            return colorableProperties?.find((property) => property.id === props.datasetViz.colorProperty);
        } else {
            return undefined;
        }
    }, [colorableProperties]);

    const colorMap = useSelector(() => props.datasetViz.colorMap);
    const enumColorMap = useSelector(() => props.datasetViz.discreteColorMap);

    return (
        <div className='dataset-vector-viz-settings'>
            <DatasetVizOpacityControl datasetViz={props.datasetViz} />
            {dimensionSelectors}
            <DatasetVectorVizFilters dataset={props.datasetViz} />
            {!!colorableProperties?.length && !!props.datasetViz.config.colorScales?.length && (
                <div className='dataset-vector-viz-colormap'>
                    <Checkbox
                        checked={!!colorProperty}
                        onChange={(evt) => {
                            if (evt.target.checked) {
                                props.datasetViz.setColorProperty(colorableProperties[0].id);
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
                                options={colorableProperties.map((property) => {
                                    return {
                                        label: property.name,
                                        value: property.id,
                                        title: property.description
                                    };
                                })}
                            />
                        </div>
                    )}
                    {colorProperty && colorMap && colorProperty.type === NUMERIC_FEATURE_PROPERTY_TYPE && (
                        <DatasetColorMapSelector
                            colorMap={colorMap}
                            colorScales={props.datasetViz.config.colorScales}
                            variable={colorProperty}
                        />
                    )}
                    {colorProperty && enumColorMap && colorProperty.type === ENUM_FEATURE_PROPERTY_TYPE && (
                        <DatasetDiscreteColorMapEditor enumColorMap={enumColorMap} enumProperty={colorProperty} />
                    )}
                </div>
            )}
        </div>
    );
};

DatasetVizSettingsFactory.register(VECTOR_VIZ_TYPE, (config) => {
    return <DatasetVectorVizSettings {...config} />;
});
