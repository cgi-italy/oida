import React from 'react';

import { Progress } from 'antd';

import { LoadingState } from '@oida/core';
import { MapLayer } from '@oida/state-mobx';
import { useSelector } from '@oida/ui-react-mobx';
import { DatasetViz } from '@oida/eo-mobx';


export type DatasetVizProgressControlProps = {
    datasetViz: DatasetViz<MapLayer>;
};

export const DatasetVizProgressControl = (props: DatasetVizProgressControlProps) => {

    const mapLayer = props.datasetViz.mapLayer;

    let loading = useSelector(() => {
        return {
            percentage: mapLayer.loadingStatus.percentage,
            state: mapLayer.loadingStatus.value,
        };
    });

    let progressVisibility : 'hidden' | 'visible' = (loading.state === LoadingState.Loading) ? 'visible' : 'hidden';

    return (
        <Progress
            style={{visibility: progressVisibility}}
            showInfo={false}
            status='active'
            strokeLinecap='square'
            strokeWidth={2}
            percent={loading.percentage !== undefined ? Math.max(loading.percentage, 20) : 50}
    ></Progress>
    );

};
