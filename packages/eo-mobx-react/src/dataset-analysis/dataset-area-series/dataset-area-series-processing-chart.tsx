import React, { useEffect, useState } from 'react';
import { reaction } from 'mobx';
import moment from 'moment';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import { Radio, Slider, Space } from 'antd';

import { LoadingState } from '@oidajs/core';
import { DataDomain, DatasetDimension, DatasetAreaSeries, DomainRange } from '@oidajs/eo-mobx';
import { useSelector } from '@oidajs/ui-react-mobx';

import { DatasetColorMapSelector } from '../../dataset-map-viz/dataset-colormap-selector';
import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';
import { DatasetAreaSeriesItemStatsTable } from './dataset-area-series-item-stats-table';
import { DatasetAreaSeriesItemPercentilesTable } from './dataset-area-series-item-pecentiles-table';
import { DatasetAreaSeriesItemHistogram } from './dataset-area-series-item-histogram';
import { DatasetAreaSeriesProcessingStatsSlider } from './dataset-area-series-processing-stats-slider';
import { DatasetAreaSeriesProcessingPercentilesSlider } from './dataset-area-series-processing-percentiles-slider';

export type DatasetAreaSeriesProcessingThumbProps = {
    data: HTMLCanvasElement | HTMLImageElement | string;
    value: number | string | Date;
    valueFormatter: (value) => string;
    dimensionConfig: DatasetDimension<DataDomain<number | string | Date>>;
};

export const DatasetAreaSeriesProcessingThumb = (props: DatasetAreaSeriesProcessingThumbProps) => {
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
            <img src={dataUri} />
            <div className='raster-sequence-thumb-caption'>
                {props.dimensionConfig.name} = {props.valueFormatter(props.value)}
            </div>
        </div>
    );
};

export type DatasetAreaSeriesProcessingChartProps = {
    series: DatasetAreaSeries;
    dataRange?: DomainRange<number>;
};

export const DatasetAreaSeriesProcessingChart = (props: DatasetAreaSeriesProcessingChartProps) => {
    const [mode, setMode] = useState('slide');

    const [activeThumb, setActiveThumb] = useState(0);

    const dimensionConfig = useSelector(() => {
        return props.series.config.dimensions.find((dimension) => dimension.id === props.series.sequenceDimension);
    });

    const variableConfig = useSelector(() => {
        return props.series.config.variables.find((variable) => variable.id === props.series.sequenceVariable);
    });

    const colorMap = useSelector(() => props.series.colorMap);
    const color = useSelector(() => props.series.color);

    const items = useSelector(() => props.series.data);
    const loadingState = useSelector(() => props.series.loadingState.value);

    useEffect(() => {
        const updateSeriesData = debounce(() => {
            props.series.retrieveData();
        }, 1000);

        const colorMapTrackerDisposer = reaction(
            () => props.series.colorMap?.getSnapshot(),
            (colorMap) => {
                updateSeriesData();
            }
        );
        return () => {
            colorMapTrackerDisposer();
        };
    }, [props.series]);

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
    const hasPercentilesData = items.length && items[0].data.stats?.percentiles !== undefined;
    const hasHistogramData = items.length && items[0].data.stats?.histogram !== undefined;

    const [statsMode, setStatsMode] = useState<'basic' | 'percentiles' | 'histogram'>('basic');

    return (
        <div className='dataset-dimension-raster-sequence-chart'>
            <AnalysisLoadingStateMessage loadingState={loadingState} errorMessage={props.series.loadingState.message} />
            {!!items.length && (
                <React.Fragment>
                    <div className='dataset-raster-sequence-selectors'>
                        {colorMap && variableConfig.colorScales && (
                            <DatasetColorMapSelector
                                colorMap={colorMap}
                                colorScales={variableConfig.colorScales}
                                variable={{
                                    ...variableConfig,
                                    domain: props.dataRange ? props.dataRange : variableConfig.domain
                                }}
                            />
                        )}
                        <div className='dataset-raster-sequence-settings'>
                            <Space direction='vertical' className='dataset-raster-sequence-display-mode-controls'>
                                <span>Display mode: </span>
                                <Radio.Group onChange={(evt) => setMode(evt.target.value)} value={mode} buttonStyle='solid' size='small'>
                                    <Space size={0}>
                                        <Radio.Button value='slide'>Slider</Radio.Button>
                                        <Radio.Button value='grid'>Grid</Radio.Button>
                                        <Radio.Button value='list'>List</Radio.Button>
                                    </Space>
                                </Radio.Group>
                            </Space>
                            {(hasPercentilesData || hasHistogramData) && mode !== 'grid' && (
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
                            )}
                        </div>
                    </div>
                    {mode !== 'slide' && (
                        <div className={classnames('dataset-raster-sequence-grid', { 'is-detailed': mode === 'list' })}>
                            {items.map((item) => {
                                return (
                                    <div className='dataset-raster-sequence-item' key={item.x.toString()}>
                                        {item.data.image && (
                                            <DatasetAreaSeriesProcessingThumb
                                                value={item.x}
                                                dimensionConfig={dimensionConfig}
                                                data={item.data.image}
                                                valueFormatter={valueFormatter}
                                            />
                                        )}
                                        {statsMode === 'basic' && (
                                            <DatasetAreaSeriesItemStatsTable
                                                dimensionConfig={dimensionConfig}
                                                variableConfig={variableConfig}
                                                item={item}
                                            />
                                        )}
                                        {statsMode === 'percentiles' && (
                                            <DatasetAreaSeriesItemPercentilesTable
                                                dimensionConfig={dimensionConfig}
                                                variableConfig={variableConfig}
                                                item={item}
                                            />
                                        )}
                                        {statsMode === 'histogram' && (
                                            <DatasetAreaSeriesItemHistogram
                                                item={item}
                                                variableConfig={variableConfig}
                                                color={color}
                                                isLoading={loadingState === LoadingState.Loading}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {mode === 'slide' && items[activeThumb] && (
                        <div className='dataset-raster-sequence-player'>
                            <div className='dataset-raster-sequence-item'>
                                {items[activeThumb].data.image && (
                                    <DatasetAreaSeriesProcessingThumb
                                        value={items[activeThumb].x}
                                        dimensionConfig={dimensionConfig}
                                        data={items[activeThumb].data.image!}
                                        valueFormatter={valueFormatter}
                                    />
                                )}
                                {statsMode === 'basic' && (
                                    <DatasetAreaSeriesItemStatsTable
                                        dimensionConfig={dimensionConfig}
                                        variableConfig={variableConfig}
                                        item={items[activeThumb]}
                                    />
                                )}
                                {statsMode === 'percentiles' && (
                                    <DatasetAreaSeriesItemPercentilesTable
                                        dimensionConfig={dimensionConfig}
                                        variableConfig={variableConfig}
                                        item={items[activeThumb]}
                                    />
                                )}
                                {statsMode === 'histogram' && (
                                    <DatasetAreaSeriesItemHistogram
                                        item={items[activeThumb]}
                                        variableConfig={variableConfig}
                                        color={color}
                                        isLoading={loadingState === LoadingState.Loading}
                                    />
                                )}
                            </div>
                            {!!items.length && !items[0].data.stats && (
                                <div className='dataset-raster-sequence-player-slider'>
                                    <Slider
                                        value={activeThumb}
                                        min={0}
                                        max={items.length - 1}
                                        marks={{
                                            0: valueFormatter(items[0].x),
                                            [items.length - 1]: valueFormatter(items[items.length - 1].x)
                                        }}
                                        tooltip={{
                                            formatter: null
                                        }}
                                        step={1}
                                        onChange={(value) => setActiveThumb(value as number)}
                                    />
                                </div>
                            )}
                            {!!items.length && items[0].data.stats !== undefined && (
                                <div className='dataset-raster-sequence-player-slider-stats'>
                                    {statsMode !== 'percentiles' && (
                                        <DatasetAreaSeriesProcessingStatsSlider
                                            items={items}
                                            dimensionConfig={dimensionConfig}
                                            variableConfig={variableConfig}
                                            color={color}
                                            activeItem={activeThumb}
                                            onActiveItemChange={(active) => setActiveThumb(active)}
                                            isLoading={loadingState === LoadingState.Loading}
                                        />
                                    )}
                                    {statsMode === 'percentiles' && (
                                        <DatasetAreaSeriesProcessingPercentilesSlider
                                            items={items}
                                            dimensionConfig={dimensionConfig}
                                            variableConfig={variableConfig}
                                            color={color}
                                            activeItem={activeThumb}
                                            onActiveItemChange={(active) => setActiveThumb(active)}
                                            isLoading={loadingState === LoadingState.Loading}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    );
};
