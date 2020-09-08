import React from 'react';
import { useObserver } from 'mobx-react';

import { Empty } from 'antd';

import { IDatasetVectorViz, VECTOR_VIZ_TYPE } from '@oida/eo';

import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetVectorFeatureList } from './dataset-vector-feature-list';


export type DatasetVectorVizSettingsProps = {
    datasetViz: IDatasetVectorViz
};

export const DatasetVectorVizSettings = (props: DatasetVectorVizSettingsProps) => {

    const aoi = useObserver(() => props.datasetViz.dataset.aoiFilter);

    if (!aoi) {
        return (
        <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={'Specify an area of interest to retrieve the data'}
            />
        );
    } else {
        return (
            <div>
                <DatasetVectorFeatureList
                    datasetViz={props.datasetViz}
                />
            </div>
        );
    }
};

DatasetVizSettingsFactory.register(VECTOR_VIZ_TYPE, (config) => {
    return <DatasetVectorVizSettings {...config}/>;
});
