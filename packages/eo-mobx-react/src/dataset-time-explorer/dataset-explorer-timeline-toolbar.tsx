import React from 'react';
import { Button, Tooltip } from 'antd';
import {
    ColumnWidthOutlined,
    AimOutlined,
    StepBackwardOutlined,
    StepForwardOutlined,
    ExpandAltOutlined,
    ShrinkOutlined
} from '@ant-design/icons';

import { DateRangeValue } from '@oidajs/core';
import { DateFieldRenderer, DateRangeFieldRenderer } from '@oidajs/ui-react-antd';

import { TimelineGroupLabelsMode } from './timeline';
import { DatasetTimelineTimeSelectionMode } from './dataset-explorer-timeline';

export type DatasetDiscoveryTimelineToolbarProps = {
    onDrawRange: () => void;
    timeSelectionMode: DatasetTimelineTimeSelectionMode;
    onTimeSelectionModeChange: (selectionMode: DatasetTimelineTimeSelectionMode) => void;
    groupLabelsMode: TimelineGroupLabelsMode;
    onGroupLabelsModeChange: (mode: TimelineGroupLabelsMode) => void;
    selectedTime: Date | DateRangeValue | undefined;
    onSelectedTimeChange: (value: Date | DateRangeValue | undefined) => void;
    isCompressed: boolean;
    onCompressToggle: () => void;
    onGoToTimeSelection: () => void;
    onGoToPrevItem: () => void;
    onGoToNextItem: () => void;
    title?: string;
    rangeModeDisabled?: boolean;
};

export const DatasetExplorerTimelineToolbar = (props: DatasetDiscoveryTimelineToolbarProps) => {
    const isRangeMode = props.timeSelectionMode === DatasetTimelineTimeSelectionMode.Range;

    let timeField: JSX.Element;

    if (!isRangeMode) {
        timeField = (
            <React.Fragment>
                <Tooltip title='Previous step'>
                    <Button size='small' onClick={props.onGoToPrevItem}>
                        <StepBackwardOutlined />
                    </Button>
                </Tooltip>
                <DateFieldRenderer
                    config={{
                        withTime: false
                    }}
                    size='small'
                    bordered={false}
                    format={'YYYY-MM-DD HH:mm:ss'}
                    suffixIcon={null}
                    required={true}
                    value={props.selectedTime as Date}
                    onChange={props.onSelectedTimeChange}
                />
                <Tooltip title='Next step'>
                    <Button size='small' onClick={props.onGoToNextItem}>
                        <StepForwardOutlined />
                    </Button>
                </Tooltip>
            </React.Fragment>
        );
    } else {
        timeField = (
            <DateRangeFieldRenderer
                config={{
                    withTime: false
                }}
                format={'YYYY-MM-DD HH:mm:ss'}
                size='small'
                bordered={false}
                suffixIcon={null}
                required={false}
                value={props.selectedTime as DateRangeValue}
                onChange={props.onSelectedTimeChange}
            />
        );
    }

    return (
        <div className='dataset-timeline-toolbar'>
            <div className='dataset-timeline-toolbar-title'>{props.title || 'Time navigation'}</div>
            <div className='dataset-timeline-time-selector'>{timeField}</div>
            <div className='dataset-timeline-selector-controls'>
                {!props.isCompressed && (
                    <Tooltip title='Center on selected time'>
                        <Button type='link' size='small' onClick={props.onGoToTimeSelection}>
                            <AimOutlined />
                        </Button>
                    </Tooltip>
                )}
                {!props.rangeModeDisabled && (
                    <Tooltip title={isRangeMode ? 'Disable range mode' : 'Enable range mode'}>
                        <Button
                            type={isRangeMode ? 'primary' : 'link'}
                            size='small'
                            onClick={() => {
                                props.onTimeSelectionModeChange(
                                    isRangeMode ? DatasetTimelineTimeSelectionMode.Instant : DatasetTimelineTimeSelectionMode.Range
                                );
                            }}
                        >
                            <ColumnWidthOutlined />
                        </Button>
                    </Tooltip>
                )}
            </div>
            <Tooltip title={props.isCompressed ? 'Expand timeline' : 'Compress timeline'}>
                <Button
                    size='small'
                    type='text'
                    onClick={() => {
                        props.onCompressToggle();
                    }}
                >
                    {props.isCompressed ? <ExpandAltOutlined /> : <ShrinkOutlined />}
                </Button>
            </Tooltip>
        </div>
    );
};
