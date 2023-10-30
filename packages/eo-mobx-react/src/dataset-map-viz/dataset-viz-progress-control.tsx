import React from 'react';

import { Progress } from 'antd';

import { LoadingState } from '@oidajs/core';
import { MapLayer } from '@oidajs/state-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';
import { DatasetViz } from '@oidajs/eo-mobx';

export type DatasetVizProgressControlProps = {
    datasetViz: DatasetViz<string, MapLayer>;
};

export const DatasetVizProgressControl = (props: DatasetVizProgressControlProps) => {
    const mapLayer = props.datasetViz.mapLayer;

    const loading = useSelector(() => {
        return {
            percentage: mapLayer.loadingStatus.percentage,
            state: mapLayer.loadingStatus.value
        };
    });

    const progressVisibility: 'hidden' | 'visible' = loading.state === LoadingState.Loading ? 'visible' : 'hidden';

    return (
        <Progress
            style={{ visibility: progressVisibility }}
            showInfo={false}
            status='active'
            strokeLinecap='square'
            size={[-1, 2]}
            percent={loading.percentage !== undefined ? Math.max(loading.percentage, 20) : 50}
        ></Progress>
    );
};
