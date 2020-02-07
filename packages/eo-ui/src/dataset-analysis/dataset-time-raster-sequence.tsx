import React, { useState, useRef, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { getSnapshot } from 'mobx-state-tree';

import { Checkbox, Slider, Form } from 'antd';

import { IDatasetTimeRasterSequence, TIME_RASTER_SEQUENCE_TYPE, DatasetVariable } from '@oida/eo';
import { DateRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { AnalysisAoiFilter } from './analysis-aoi-filter';
import { AnalysisLoadingStateMessage } from './analysis-loading-state-message';

import { DatasetColormapPresetSelector } from '../dataset-map-viz/dataset-colormap-selector';


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
    dataDomain?: DatasetVariable<Date>;
    sequence: IDatasetTimeRasterSequence;
};

export const DatasetTimeRasterSequence = (props: DatasetTimeRasterSequenceProps) => {

    let [activeThumb, setActiveThumb] = useState(-1);

    let dataDomain = props.dataDomain;
    let dataRange = dataDomain ? dataDomain.range : undefined;

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

    return (
        <div className='dataset-raster-sequence'>
            <Form layout='inline'>
                <Form.Item>
                    <DateRangeFieldRenderer
                        value={range}
                        onChange={(value) => {
                            props.sequence.setRange(value);
                        }}
                        config={{
                            minDate: dataRange ? dataRange.min : undefined,
                            maxDate: dataRange ? dataRange.max : undefined
                        }}
                    />
                </Form.Item>
                <Form.Item>
                    <AnalysisAoiFilter
                        analysis={props.sequence}
                        supportedGeometries={['BBox']}
                    />
                </Form.Item>
            </Form>
            {props.sequence.colorMap &&
                <DatasetColormapPresetSelector
                    colorMap={props.sequence.colorMap}
                    presets={props.sequence.config.colorMap.colorMaps!}
                    variables={props.sequence.config.colorMap.variables!}
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
                            0: `${range.start.toISOString()}`,
                            [(thumbs.length - 1)]: `${range.end.toISOString()}`
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

    let analysis = config.analysis as IDatasetTimeRasterSequence;
    if (!analysis.colorMap) {
        analysis.setColorMap(analysis.config.colorMap.default);
    }
    if (!analysis.range) {
        let toi = analysis.dataset.searchParams.filters.get('time');
        if (toi) {
            analysis.setRange({
                start: toi.start.getTime(),
                end: toi.end.getTime()
            });
        } else if (analysis.dataset.config!.timeDistribution) {
            let timeProvider = analysis.dataset.config!.timeDistribution.provider;
            timeProvider.getTimeExtent({}).then((range) => {
                if (range) {
                    analysis.setRange({
                        start: range.start,
                        end: range.end
                    });
                }
            });
        }
    }

    return <DatasetTimeRasterSequence
        sequence={analysis}
        dataDomain={analysis.config.domain}
    />;
});
