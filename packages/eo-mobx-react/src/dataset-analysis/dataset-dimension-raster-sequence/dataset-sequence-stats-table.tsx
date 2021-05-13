import React from 'react';
import moment from 'moment';
import { Descriptions } from 'antd';

import { DataDomain, DatasetDimension, DatasetRasterSequenceItem, isDomainProvider, NumericDomainMapper, RasterBandConfig } from '@oida/eo-mobx';


export type DatasetSequenceItemStatsTable = {
    item: DatasetRasterSequenceItem;
    variableConfig: RasterBandConfig;
    dimensionConfig: DatasetDimension<DataDomain<number | Date | string>>;
};

export const DatasetSequenceItemsStatsTable = (props: DatasetSequenceItemStatsTable) => {

    const stats = props.item.stats;

    if (!stats) {
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


    return (
        <Descriptions
            className='dataset-sequence-item-stats-table'
            size='small'
            column={1}
        >
            <Descriptions.Item label='Variable'>{props.variableConfig.name}</Descriptions.Item>
            <Descriptions.Item label={props.dimensionConfig.name}>{dimensionFormatter(props.item.x) }</Descriptions.Item>
            {props.variableConfig.units &&
                <Descriptions.Item label='Units'>
                    {props.variableConfig.units}
                </Descriptions.Item>
            }
            {stats.min !== undefined &&
                <Descriptions.Item label='Min'>
                    {domainMapper.formatValue(stats.min, {
                        precision: 3
                    })}
                </Descriptions.Item>
            }
            {stats.max !== undefined &&
                <Descriptions.Item label='Max'>
                    {domainMapper.formatValue(stats.max, {
                        precision: 3
                    })}
                </Descriptions.Item>
            }
            {stats.mean !== undefined &&
                <Descriptions.Item label='Mean'>
                    {domainMapper.formatValue(stats.mean, {
                        precision: 3
                    })}
                </Descriptions.Item>
            }
            {stats.variance !== undefined &&
                <Descriptions.Item label='Standard deviation'>
                    {(Math.sqrt(stats.variance) * domainMapper.domainScalingFactor).toFixed(3)}
                </Descriptions.Item>
            }
            {stats.median !== undefined &&
                <Descriptions.Item label='Median'>
                    {domainMapper.formatValue(stats.median, {
                        precision: 3
                    })}
                </Descriptions.Item>
            }
        </Descriptions>
    );
};
