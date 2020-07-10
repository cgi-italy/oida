import React, { useState, useRef, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { getSnapshot } from 'mobx-state-tree';

import { Checkbox, Slider, Form } from 'antd';

import {
    IDatasetAnalysis, IDatasetDimensionRasterSequence, DIMENSION_RASTER_SEQUENCE_TYPE,
    DatasetDimension,
    DataDomain
} from '@oida/eo';


import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { AnalysisLoadingStateMessage } from '../analysis-loading-state-message';

import { DatasetColormapSelector } from '../../dataset-map-viz/dataset-colormap-selector';
import { DatasetDimensionRasterSequenceFilters } from './dataset-dimension-raster-sequence-filters';

export type DatasetDomainRasterSequenceThumbProps = {
    data: any;
    colorMap;
    imageGenerator;
    value: number | string | Date;
    valueFormatter: (value) => string;
    dimensionConfig: DatasetDimension<DataDomain<number | string | Date>>;
};

export const DatasetDomainRasterSequenceThumb = (props: DatasetDomainRasterSequenceThumbProps) => {
    let canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            props.imageGenerator(props.data, props.colorMap, canvasRef.current);
        }
    }, [canvasRef.current, props.data, props.colorMap]);

    return (
        <div className='raster-sequence-thumb'>
            <canvas ref={canvasRef}></canvas>
            <div>{props.dimensionConfig.name} = {props.valueFormatter(props.value)}</div>
        </div>
    );
};

export type DatasetDimensionRasterSequenceProps = {
    sequence: IDatasetDimensionRasterSequence;
    analysis: IDatasetAnalysis
};

export const DatasetDimensionRasterSequence = (props: DatasetDimensionRasterSequenceProps) => {

    let [activeThumb, setActiveThumb] = useState(-1);

    const dimensionConfig = useObserver(() => {
        return props.sequence.config.dimensions.find(dimension => dimension.id === props.sequence.dimension);
    });
    const colorMap = useObserver(() => {
        return props.sequence.colorMap ? getSnapshot(props.sequence.colorMap) : undefined;
    });
    const data = useObserver(() => props.sequence.data);
    const loadingState = useObserver(() => props.sequence.loadingState);

    if (!dimensionConfig) {
        return null;
    }

    if (activeThumb !== -1 && activeThumb >= data.length) {
        activeThumb = 0;
    }

    const valueFormatter = (value) => {
        if (dimensionConfig.id === 'time') {
            return (value as Date).toISOString();
        } else {
            return `${value} ${dimensionConfig.units ? dimensionConfig.units : ''}`;
        }
    };

    let thumbs = data.map((item) => {
        return (
            <DatasetDomainRasterSequenceThumb
                key={item.x.toString()}
                value={item.x}
                dimensionConfig={dimensionConfig}
                colorMap={colorMap}
                data={item.data}
                imageGenerator={props.sequence.config.imageGenerator}
                valueFormatter={valueFormatter}
            />
        );
    });

    return (
        <div className='dataset-raster-sequence'>
            <div className='analysis-parameters'>
                <Form layout='inline' size='small'>
                    <DatasetDimensionRasterSequenceFilters
                        analysis={props.analysis}
                    />
                </Form>
            </div>
            {props.sequence.colorMap &&
                <DatasetColormapSelector
                    colorMap={props.sequence.colorMap}
                    presets={props.sequence.config.colorMap.colorMaps}
                    variables={props.sequence.config.colorMap.variables}
                />
            }
            <Checkbox
                checked={activeThumb !== -1}
                onChange={(evt) => {
                    if (evt.target.checked) {
                        setActiveThumb(0);
                    } else {
                        setActiveThumb(-1);
                    }
                }}
            >
                Slider mode
            </Checkbox>
            <AnalysisLoadingStateMessage
                loadingState={loadingState}
                initMessage='Specify an area and a height range to retrieve the data'
            />
            {activeThumb !== -1 && data[activeThumb] &&
                <div className='dataset-raster-sequence-player'>
                    <DatasetDomainRasterSequenceThumb
                        value={data[activeThumb].x}
                        dimensionConfig={dimensionConfig}
                        colorMap={colorMap}
                        data={data[activeThumb].data}
                        imageGenerator={props.sequence.config.imageGenerator}
                        valueFormatter={valueFormatter}
                    />
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
            {activeThumb === -1 &&
                <div className='dataset-raster-sequence-thumbs'>
                    {thumbs}
                </div>
            }
        </div>
    );
};

DatasetAnalysisWidgetFactory.register(DIMENSION_RASTER_SEQUENCE_TYPE, (config: DatasetAnalysisWidgetFactoryConfig) => {

    let analysis = config.combinedAnalysis.analyses[0];
    let rasterSequence = analysis.datasetViz as IDatasetDimensionRasterSequence;

    return <DatasetDimensionRasterSequence
        analysis={analysis}
        sequence={rasterSequence}
    />;
});
