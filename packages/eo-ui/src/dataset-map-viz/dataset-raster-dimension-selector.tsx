import React from 'react';
import { useObserver } from 'mobx-react';

import { Slider, Select } from 'antd';

import { IDatasetRasterViz, DatasetDimension, ValueDomain, CategoricalDomain, isValueDomain } from '@oida/eo';


type ValueDimension = Omit<DatasetDimension<number>, 'domain'> & {domain: ValueDomain<number>};
type CategoricalDimension = Omit<DatasetDimension<number | string>, 'domain'> & {domain: CategoricalDomain<number | string>};

export type DatasetRasterValueDimensionSelectorProps = {
    datasetViz: IDatasetRasterViz;
    dimension: ValueDimension;
};

export const DatasetRasterValueDimensionSelector = (props: DatasetRasterValueDimensionSelectorProps) => {

    const value = useObserver(() => {
        let val = props.datasetViz.dimensionValues.get(props.dimension.id);
        return val ? val as number : undefined;
    });

    const domain = props.dimension.domain;

    let marks = {
        [domain.min]: `${domain.min} ${props.dimension.units}`,
        [domain.max]: `${domain.max} ${props.dimension.units}`,
    };

    return (
        <div className='dataset-dimension-selector'>
            <span>{props.dimension.name}: </span>
            <Slider
                min={domain.min}
                max={domain.max}
                step={domain.step}
                value={value}
                marks={marks}
                onChange={(value) => props.datasetViz.setDimensionValue(props.dimension.id, value as number)}
                tipFormatter={(value) => `${value} ${props.dimension.units}`}
            />
        </div>
    );
};


export type DatasetRasterCategoricalDimensionSelectorProps = {
    datasetViz: IDatasetRasterViz;
    dimension: CategoricalDimension;
};

export const DatasetRasterCategoricalDimensionSelector = (props: DatasetRasterCategoricalDimensionSelectorProps) => {

    const value = useObserver(() => {
        return props.datasetViz.dimensionValues.get(props.dimension.id);
    });

    const domain = props.dimension.domain;

    const domainOptions = domain.map((item) => {
        return (<Select.Option key={item.value} value={item.value}>{item.label || item.value}</Select.Option>);
    });

    return (
        <div className='dataset-dimension-selector'>
            <span>{props.dimension.name}: </span>
            <Select
                value={value}
                onChange={(value) => {
                    props.datasetViz.setDimensionValue(props.dimension.id, value);
                }}
            >
                {domainOptions}
            </Select>
        </div>
    );
};

export type DatasetRasterDimensionSelectorProps = {
    datasetViz: IDatasetRasterViz;
    dimension: DatasetDimension<number | string>;
};

export const DatasetRasterDimensionSelector = (props: DatasetRasterDimensionSelectorProps) => {

    const domain = props.dimension.domain;
    if (!domain) {
        return null;
    }

    if (isValueDomain(domain)) {
        return (
            <DatasetRasterValueDimensionSelector
                datasetViz={props.datasetViz}
                dimension={props.dimension as ValueDimension}
            />
        );
    } else {
        return (
            <DatasetRasterCategoricalDimensionSelector
                datasetViz={props.datasetViz}
                dimension={props.dimension as CategoricalDimension}
            />
        );
    }
};
