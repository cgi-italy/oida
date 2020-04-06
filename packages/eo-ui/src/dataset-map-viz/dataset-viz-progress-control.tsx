import React from 'react';

import { useObserver } from 'mobx-react';

import { Progress } from 'antd';

import { LoadingState } from '@oida/core';
import { IDatasetViz } from '@oida/eo';

export type DatasetVizProgressControlProps = {
    datasetViz: IDatasetViz;
};

export const DatasetVizProgressControl = (props: DatasetVizProgressControlProps) => {

    let loading = useObserver(() => {

        let mapLayer = props.datasetViz.mapLayer;
        if (mapLayer) {
            return {
                percentage: mapLayer.loadingPercentage,
                state: mapLayer.loadingState,
            };
        } else {
            return {
                percentage: 0,
                state: LoadingState.Loading
            };
        }
    });

    let progressVisibility : 'hidden' | 'visible' = (loading.state === LoadingState.Loading) ? 'visible' : 'hidden';

    return (
        <Progress
            style={{visibility: progressVisibility}}
            showInfo={false}
            status='active'
            strokeLinecap='square'
            strokeWidth={1}
            percent={loading.percentage !== undefined ? Math.max(loading.percentage, 20) : 50}
    ></Progress>
    );

};
