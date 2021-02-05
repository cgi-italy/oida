import React from 'react';
import { Button, Tooltip } from 'antd';
import { FastBackwardOutlined, StepBackwardOutlined, CaretRightOutlined, PauseOutlined, StepForwardOutlined, FastForwardOutlined } from '@ant-design/icons';
import { DatasetVizOpacityControl, DatasetVizSettingsFactory } from '@oida/eo-mobx-react';

import { DatasetVideoMapViz, VIDEO_VIZ_TYPE } from '@oida/eo-video';
import { useSelector } from '@oida/ui-react-mobx';


export type DatasetVideoVizSettingsProps = {
    datasetViz: DatasetVideoMapViz
};

export const VideoControls = (props: DatasetVideoVizSettingsProps) => {

    const isPlaying = useSelector(() => props.datasetViz.source.isPlaying);

    return (
        <div className='dataset-video-controls'>
            <Tooltip title='Go to video beginning'>
                <Button
                    disabled={isPlaying}
                    onClick={() => props.datasetViz.source.seek(0)}
                >
                    <FastBackwardOutlined/>
                </Button>
            </Tooltip>
            <Tooltip title='Step backward'>
                <Button
                    disabled={isPlaying}
                    onClick={() => props.datasetViz.source.stepBackward()}
                >
                    <StepBackwardOutlined/>
                </Button>
            </Tooltip>
            {!isPlaying &&
                <Button onClick={() => props.datasetViz.source.play()}>
                    <CaretRightOutlined/>
                </Button>
            }
            {isPlaying &&
                <Button onClick={() => props.datasetViz.source.stop()}>
                    <PauseOutlined/>
                </Button>
            }
            <Tooltip title='Step forward'>
                <Button
                    disabled={isPlaying}
                    onClick={() => props.datasetViz.source.stepForward()}
                >
                    <StepForwardOutlined/>
                </Button>
            </Tooltip>
            <Tooltip title='Go to video end'>
                <Button
                    disabled={isPlaying}
                    onClick={() => props.datasetViz.source.seek(props.datasetViz.source.duration)}
                >
                    <FastForwardOutlined/>
                </Button>
            </Tooltip>
        </div>
    );
};


export const DatasetVideoVizSettings = (props: DatasetVideoVizSettingsProps) => {

    return (
        <div className='dataset-video-viz-settings'>
            <DatasetVizOpacityControl
                datasetViz={props.datasetViz}
            />
            <VideoControls datasetViz={props.datasetViz}/>
        </div>
    );
};

DatasetVizSettingsFactory.register(VIDEO_VIZ_TYPE, (config) => {
    return <DatasetVideoVizSettings {...config}/>;
});
