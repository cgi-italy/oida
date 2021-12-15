import React from 'react';
import { observer } from 'mobx-react';
import { Descriptions } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { DateQuantity, LoadingState } from '@oidajs/core';
import { DatasetRasterPointInfo, isDomainProvider, NumericDomainMapper } from '@oidajs/eo-mobx';
import { useFormatter } from '@oidajs/ui-react-mobx';


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

                let content: React.ReactNode;
                let label: string;
                if (typeof(value) === 'number') {
                    const bandDetails = props.pointInfo.config.variables.find((band) => band.id === bandId);

                    const domainMapper = new NumericDomainMapper({
                        domain: bandDetails?.domain && !isDomainProvider(bandDetails?.domain) ? bandDetails?.domain : undefined,
                        unitsSymbol: bandDetails?.units
                    });

                    label = bandDetails?.name || bandId;
                    content = domainMapper.formatValue(value, {
                        precision: 3,
                        maxLength: 10,
                        appendUnits: true
                    });
                } else {
                    label = bandId;
                    content = (
                        <div dangerouslySetInnerHTML={{
                            __html: value
                        }}/>
                    );
                }
                return (
                    <Descriptions.Item key={bandId} label={label}>
                        {content}
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
