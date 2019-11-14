import React from 'react';

import { useObserver } from 'mobx-react';

import { Progress } from 'antd';

import { LoadingState } from '@oida/core';
import { IDatasetMapViz } from '@oida/eo';

export type DatasetVizProgressControlProps = {
    datasetViz: IDatasetMapViz;
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
            percent={loading.percentage }
    ></Progress>
    );

};
