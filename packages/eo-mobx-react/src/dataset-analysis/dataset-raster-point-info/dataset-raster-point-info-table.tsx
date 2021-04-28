import React from 'react';
import { observer } from 'mobx-react';
import { Descriptions } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { DateQuantity, LoadingState } from '@oida/core';
import { DatasetRasterPointInfo, isDomainProvider, NumericDomainMapper } from '@oida/eo-mobx';
import { useFormatter } from '@oida/ui-react-mobx';


export type DatasetRasterPointInfoTableProps = {
    pointInfo: DatasetRasterPointInfo;
};

export const DatasetRasterPointInfoTable = observer((props: DatasetRasterPointInfoTableProps) => {

    const dateFormatter = useFormatter(DateQuantity);

    if (props.pointInfo.loadingState.value === LoadingState.Loading) {
        return <SyncOutlined spin/>;
    } else {
        if (props.pointInfo.data) {
            const dimensionValues: JSX.Element[] = [];

            props.pointInfo.dimensions.values.forEach((value, id) => {
                const dimensionConfig = props.pointInfo.config.dimensions.find((dimension) => dimension.id === id);
                dimensionValues.push((
                    <Descriptions.Item key={id} label={dimensionConfig?.name || id}>
                        {value instanceof Date ? dateFormatter(value, {}) : value} {dimensionConfig?.units}
                    </Descriptions.Item>
                ));
            });

            const bandValues = Object.entries(props.pointInfo.data).map(([bandId, value]) => {
                const bandDetails = props.pointInfo.config.variables.find((band) => band.id === bandId);

                const domainMapper = new NumericDomainMapper({
                    domain: bandDetails?.domain && !isDomainProvider(bandDetails?.domain) ? bandDetails?.domain : undefined,
                    unitsSymbol: bandDetails?.units
                });
                return (
                    <Descriptions.Item key={bandId} label={bandDetails?.name || bandId}>
                        {domainMapper.formatValue(value, {
                            precision: 3,
                            appendUnits: true
                        })}
                    </Descriptions.Item>
                );
            });
            return (
                <Descriptions
                    size='small'
                    column={1}
                >
                    {dimensionValues}
                    {bandValues}
                </Descriptions>
            );
        } else {
            return null;
        }
    }
});
