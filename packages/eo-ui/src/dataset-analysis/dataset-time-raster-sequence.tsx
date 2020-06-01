import React, { useState, useRef, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { getSnapshot } from 'mobx-state-tree';

import { Checkbox, Slider, Form } from 'antd';

import { IDatasetAnalysis, IDatasetTimeRasterSequence, TIME_RASTER_SEQUENCE_TYPE, DatasetVariable, isValueDomain } from '@oida/eo';
import { DateRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { AnalysisAoiFilter } from './analysis-aoi-filter';
import { AnalysisLoadingStateMessage } from './analysis-loading-state-message';

import { DatasetColormapSelector } from '../dataset-map-viz/dataset-colormap-selector';


export type DatasetTimeRasterSequenceThumbProps = {
    data: any;
    colorMap;
    imageGenerator;
    domainValue;
    domainConfig;
};

export const DatasetTimeRasterSequenceThumb = (props: DatasetTimeRasterSequenceThumbProps) => {
    let canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            props.imageGenerator(props.data, props.colorMap, canvasRef.current);
        }
    });

    return (
        <div className='raster-sequence-thumb'>
            <canvas ref={canvasRef}></canvas>
            <div>{props.domainConfig.name} = {props.domainValue.toISOString()} {props.domainConfig.units}</div>
        </div>
    );
};

export type DatasetTimeRasterSequenceProps = {
    dataDomain: DatasetVariable<Date>;
    sequence: IDatasetTimeRasterSequence;
    analysis: IDatasetAnalysis;
};

export const DatasetTimeRasterSequence = (props: DatasetTimeRasterSequenceProps) => {

    let [activeThumb, setActiveThumb] = useState(-1);

    let dataDomain = props.dataDomain;

    let range = useObserver(() => props.sequence.range);

    let colorMap = useObserver(() => {
        return props.sequence.colorMap ? getSnapshot(props.sequence.colorMap) : undefined;
    });

    let data =  useObserver(() => props.sequence.data);

    let thumbs = data.map((item) => {
        return (
            <DatasetTimeRasterSequenceThumb
                key={item.x.getTime()}
                domainValue={item.x}
                domainConfig={dataDomain}
                colorMap={colorMap}
                data={item.data}
                imageGenerator={props.sequence.config.imageGenerator}
            />
        );
    });

    let loadingState = useObserver(() => props.sequence.loadingState);

    let rangeConfig;
    if (props.dataDomain.domain && isValueDomain(props.dataDomain.domain)) {
        rangeConfig = {
            minDate: props.dataDomain.domain.min,
            maxDate: props.dataDomain.domain.max
        };
    }

    return (
        <div className='dataset-raster-sequence'>
            <Form layout='inline' size='small'>
                <Form.Item>
                    <DateRangeFieldRenderer
                        value={range ? {
                            start: range.min,
                            end: range.max
                        } : undefined}
                        onChange={(value) => {
                            props.sequence.setRange(value ? {
                                min: value.start,
                                max: value.end
                            } : undefined);
                        }}
                        config={rangeConfig || {}}
                    />
                </Form.Item>
                <Form.Item>
                    <AnalysisAoiFilter
                        analysis={props.analysis}
                        supportedGeometries={props.sequence.config.supportedGeometries}
                    />
                </Form.Item>
            </Form>
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
                initMessage='Specify an area and a time range to retrieve the data'
            />
            {activeThumb !== -1 && range &&
                <div className='dataset-raster-sequence-player'>
                    <DatasetTimeRasterSequenceThumb
                        domainValue={data[activeThumb].x}
                        domainConfig={dataDomain}
                        colorMap={colorMap}
                        data={data[activeThumb].data}
                        imageGenerator={props.sequence.config.imageGenerator}
                    />
                    <Slider
                        value={activeThumb}
                        min={0}
                        max={thumbs.length - 1}
                        marks={{
                            0: `${range.min.toISOString()}`,
                            [(thumbs.length - 1)]: `${range.max.toISOString()}`
                        }}
                        tooltipVisible={false}
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

DatasetAnalysisWidgetFactory.register(TIME_RASTER_SEQUENCE_TYPE, (config) => {

    let analysis = config.analysis as IDatasetAnalysis;
    let rasterSequenceViz = analysis.datasetViz as IDatasetTimeRasterSequence;
    if (!rasterSequenceViz.colorMap) {
        rasterSequenceViz.setColorMap(rasterSequenceViz.config.colorMap.default);
    }
    if (!rasterSequenceViz.range) {
        let toi = rasterSequenceViz.dataset.searchParams.filters.get('time');
        if (toi) {
            rasterSequenceViz.setRange({
                min: toi.start,
                max: toi.end
            });
        } else if (rasterSequenceViz.dataset.config.timeDistribution) {
            let timeProvider = rasterSequenceViz.dataset.config.timeDistribution.provider;
            timeProvider.getTimeExtent({}).then((range) => {
                if (range && range.end) {
                    rasterSequenceViz.setRange({
                        min: new Date(range.start),
                        max: new Date(range.end)
                    });
                }
            });
        }
    }

    return <DatasetTimeRasterSequence
        analysis={analysis}
        sequence={rasterSequenceViz}
        dataDomain={rasterSequenceViz.config.domain}
    />;
});
