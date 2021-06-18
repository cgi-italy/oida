import React, { useEffect, useState } from 'react';
import { reaction } from 'mobx';
import moment from 'moment';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import { Radio, Slider, Space } from 'antd';

import { LoadingState } from '@oida/core';
import { DataDomain, DatasetDimension, DatasetDimensionRasterSequence } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

import { DatasetColorMapSelector } from '../../dataset-map-viz/dataset-colormap-selector';
import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { DatasetRasterSequenceItemHistogram } from './dataset-sequence-item-histogram';
import { DatasetRasterSequenceStatsSlider } from './dataset-sequence-stats-slider';
import { DatasetSequenceItemStatsTable } from './dataset-sequence-item-stats-table';
import { DatasetRasterSequencePercentilesSlider } from './dataset-sequence-percentiles-slider';
import { DatasetSequenceItemPercentilesTable } from './dataset-sequence-item-pecentiles-table';


export type DatasetDimensionRasterSequenceThumbProps = {
    data: HTMLCanvasElement | HTMLImageElement | string;
    value: number | string | Date;
    valueFormatter: (value) => string;
    dimensionConfig: DatasetDimension<DataDomain<number | string | Date>>;
};

export const DatasetDimensionRasterSequenceThumb = (props: DatasetDimensionRasterSequenceThumbProps) => {

    const [dataUri, setDataUri] = useState<string>();

    useEffect(() => {
        if (props.data instanceof HTMLCanvasElement) {
            setDataUri(props.data.toDataURL());
        } else if (props.data instanceof HTMLImageElement) {
            setDataUri(props.data.src);
        } else {
            setDataUri(props.data);
        }
    }, [props.data]);


    return (
        <div className='raster-sequence-thumb'>
            <img src={dataUri}/>
            <div className='raster-sequence-thumb-caption'>{props.dimensionConfig.name} = {props.valueFormatter(props.value)}</div>
        </div>
    );
};


export type DatasetDimensionRasterSequenceChartProps = {
    sequence: DatasetDimensionRasterSequence;
};

export const DatasetDimensionRasterSequenceChart = (props: DatasetDimensionRasterSequenceChartProps) => {

    const [mode, setMode] = useState('grid');

    const [activeThumb, setActiveThumb] = useState(0);

    const dimensionConfig = useSelector(() => {
        return props.sequence.config.dimensions.find((dimension) => dimension.id === props.sequence.sequenceDimension);
    });

    const variableConfig = useSelector(() => {
        return props.sequence.config.variables.find((variable) => variable.id === props.sequence.sequenceVariable);
    });

    const colorMap = useSelector(() => props.sequence.colorMap);

    const data = useSelector(() => props.sequence.data);
    const loadingState = useSelector(() => props.sequence.loadingState.value);

    useEffect(() => {
        const updateSequenceData = debounce(() => {
            props.sequence.retrieveData();
        }, 1000);

        const colorMapTrackerDisposer = reaction(() => props.sequence.colorMap?.asProps(), (colorMap) => {
            updateSequenceData();
        });
        return () => {
            colorMapTrackerDisposer();
        };
    }, [props.sequence]);

    if (!dimensionConfig || !variableConfig) {
        return null;
    }

    const valueFormatter = (value) => {
        if (dimensionConfig.id === 'time') {
            return moment.utc(value).format('YYYY-MM-DD HH:mm');
        } else {
            return `${value} ${dimensionConfig.units ? dimensionConfig.units : ''}`;
        }
    };

    // the assumption here is that the set of available statistics are the same for all the items
    const hasPercentilesData = data.length && data[0].stats?.percentiles !== undefined;
    const hasHistogramData = data.length && data[0].stats?.histogram !== undefined;

    const [statsMode, setStatsMode] = useState<'basic' | 'percentiles' | 'histogram'>('basic');

    return (
        <div className='dataset-dimension-raster-sequence-chart'>
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                errorMessage={props.sequence.loadingState.message}
            />
            {!!data.length &&
                <React.Fragment>
                    <div className='dataset-raster-sequence-selectors'>
                        {colorMap && variableConfig.colorScales &&
                            <DatasetColorMapSelector
                                colorMap={colorMap}
                                colorScales={variableConfig.colorScales}
                                variable={variableConfig}
                            />
                        }
                        <div className='dataset-raster-sequence-settings'>
                            <Space direction='vertical' className='dataset-raster-sequence-display-mode-controls'>
                                <span>Display mode: </span>
                                <Radio.Group
                                    onChange={(evt) => setMode(evt.target.value)}
                                    value={mode}
                                    buttonStyle='solid'
                                    size='small'
                                >
                                    <Space size={0}>
                                        <Radio.Button value='grid'>Grid</Radio.Button>
                                        <Radio.Button value='list'>List</Radio.Button>
                                        <Radio.Button value='slide'>Slider</Radio.Button>
                                    </Space>
                                </Radio.Group>
                            </Space>
                            {(hasPercentilesData || hasHistogramData) && mode !== 'grid' &&
                                <Space direction='vertical' className='dataset-raster-sequence-stats-mode-controls'>
                                    <span>Statistics mode: </span>
                                    <Radio.Group
                                        onChange={(evt) => setStatsMode(evt.target.value)}
                                        value={statsMode}
                                        buttonStyle='solid'
                                        size='small'
                                        className='stats-mode-selector'
                                    >
                                        <Space size={0}>
                                            <Radio.Button value='basic'>Basic</Radio.Button>
                                            {hasPercentilesData && <Radio.Button value='percentiles'>Percentiles</Radio.Button>}
                                            {hasHistogramData && <Radio.Button value='histogram'>Histogram</Radio.Button>}
                                        </Space>
                                    </Radio.Group>
                                </Space>
                            }
                        </div>
                    </div>
                    {mode !== 'slide' &&
                        <div className={classnames('dataset-raster-sequence-grid', {'is-detailed': mode === 'list'})}>
                            {data.map((item) => {
                                return (
                                    <div className='dataset-raster-sequence-item' key={item.x.toString()}>
                                        <DatasetDimensionRasterSequenceThumb
                                            value={item.x}
                                            dimensionConfig={dimensionConfig}
                                            data={item.data}
                                            valueFormatter={valueFormatter}
                                        />
                                        {statsMode === 'basic' &&
                                            <DatasetSequenceItemStatsTable
                                                dimensionConfig={dimensionConfig}
                                                variableConfig={variableConfig}
                                                item={item}
                                            />
                                        }
                                        {statsMode === 'percentiles' &&
                                            <DatasetSequenceItemPercentilesTable
                                                dimensionConfig={dimensionConfig}
                                                variableConfig={variableConfig}
                                                item={data[activeThumb]}
                                            />
                                        }
                                        {statsMode === 'histogram' &&
                                            <DatasetRasterSequenceItemHistogram
                                                item={item}
                                                variableConfig={variableConfig}
                                                color={props.sequence.color}
                                                isLoading={loadingState === LoadingState.Loading}
                                            />
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    }
                    {mode === 'slide' && data[activeThumb] &&
                        <div className='dataset-raster-sequence-player'>
                            <div className='dataset-raster-sequence-item'>
                                <DatasetDimensionRasterSequenceThumb
                                    value={data[activeThumb].x}
                                    dimensionConfig={dimensionConfig}
                                    data={data[activeThumb].data}
                                    valueFormatter={valueFormatter}
                                />
                                {statsMode === 'basic' &&
                                    <DatasetSequenceItemStatsTable
                                        dimensionConfig={dimensionConfig}
                                        variableConfig={variableConfig}
                                        item={data[activeThumb]}
                                    />
                                }
                                {statsMode === 'percentiles' &&
                                    <DatasetSequenceItemPercentilesTable
                                        dimensionConfig={dimensionConfig}
                                        variableConfig={variableConfig}
                                        item={data[activeThumb]}
                                    />
                                }
                                {statsMode === 'histogram' &&
                                    <DatasetRasterSequenceItemHistogram
                                        item={data[activeThumb]}
                                        variableConfig={variableConfig}
                                        color={props.sequence.color}
                                        isLoading={loadingState === LoadingState.Loading}
                                    />
                                }
                            </div>
                            {!!data.length && !data[0].stats &&
                                <div className='dataset-raster-sequence-player-slider'>
                                    <Slider
                                        value={activeThumb}
                                        min={0}
                                        max={data.length - 1}
                                        marks={{
                                            0: valueFormatter(data[0].x),
                                            [data.length - 1]: valueFormatter(data[data.length - 1].x)
                                        }}
                                        tipFormatter={null}
                                        step={1}
                                        onChange={(value) => setActiveThumb(value as number)}
                                    />
                                </div>
                            }
                            {!!data.length && data[0].stats !== undefined &&
                                <div className='dataset-raster-sequence-player-slider-stats'>
                                    {statsMode !== 'percentiles' &&
                                        <DatasetRasterSequenceStatsSlider
                                            data={data}
                                            dimensionConfig={dimensionConfig}
                                            variableConfig={variableConfig}
                                            color={props.sequence.color}
                                            activeItem={activeThumb}
                                            onActiveItemChange={(active) => setActiveThumb(active)}
                                            isLoading={loadingState === LoadingState.Loading}
                                        />
                                    }
                                    {statsMode === 'percentiles' &&
                                        <DatasetRasterSequencePercentilesSlider
                                            data={data}
                                            dimensionConfig={dimensionConfig}
                                            variableConfig={variableConfig}
                                            color={props.sequence.color}
                                            activeItem={activeThumb}
                                            onActiveItemChange={(active) => setActiveThumb(active)}
                                            isLoading={loadingState === LoadingState.Loading}
                                        />
                                    }
                                </div>
                            }
                        </div>
                    }
                </React.Fragment>
            }
        </div>
    );

};
