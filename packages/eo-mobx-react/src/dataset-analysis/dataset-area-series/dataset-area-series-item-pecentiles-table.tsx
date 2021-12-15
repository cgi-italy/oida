import React from 'react';
import moment from 'moment';
import { Descriptions } from 'antd';

import { DataDomain, DatasetDimension, DatasetAreaSeriesDataItem, isDomainProvider, NumericDomainMapper, RasterBandConfig } from '@oidajs/eo-mobx';


export type DatasetAreaSeriesItemPercentilesTableProps = {
    item: DatasetAreaSeriesDataItem;
    variableConfig: RasterBandConfig;
    dimensionConfig: DatasetDimension<DataDomain<number | Date | string>>;
};

export const DatasetAreaSeriesItemPercentilesTable = (props: DatasetAreaSeriesItemPercentilesTableProps) => {

    const stats = props.item.data.stats;

    if (!stats || !stats.percentiles) {
        return null;
    }

    const variableDomain = props.variableConfig.domain;
    const domainMapper = new NumericDomainMapper({
        domain: variableDomain && !isDomainProvider(variableDomain) ? variableDomain : undefined,
        unitsSymbol: props.variableConfig.units
    });

    const dimensionFormatter = (value) => {
        if (value instanceof Date) {
            return moment.utc(value).format('YYYY-MM-DD');
        } else {
            return value.toString();
        }
    };

    const percentileItems = stats.percentiles.map((percentile) => {
        return (
            <Descriptions.Item label={percentile[0]} key={`percentile-${percentile[0]}`}>
                {domainMapper.formatValue(percentile[1], {
                    precision: 3
                })}
            </Descriptions.Item>
        );
    });

    return (
        <Descriptions
            className='dataset-sequence-item-stats-table'
            size='small'
            column={2}
        >
            <Descriptions.Item label='Variable' span={2}>{props.variableConfig.name}</Descriptions.Item>
            <Descriptions.Item label={props.dimensionConfig.name} span={2}>{dimensionFormatter(props.item.x) }</Descriptions.Item>
            {props.variableConfig.units &&
                <Descriptions.Item label='Units' span={2}>
                    {props.variableConfig.units}
                </Descriptions.Item>
            }
            {percentileItems}
        </Descriptions>
    );
};
