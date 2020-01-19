import React, { useState, useRef, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { getSnapshot } from 'mobx-state-tree';

import { Checkbox, Slider, Form } from 'antd';

import { LoadingState } from '@oida/core';
import { IDatasetDomainRasterSequence, DOMAIN_RASTER_SEQUENCE_TYPE, DatasetVariable } from '@oida/eo';
import { NumericRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { AnalysisAoiFilter } from './analysis-aoi-filter';
import { DatasetColormapPresetSelector } from '../dataset-map-viz/dataset-colormap-selector';


export type DatasetRasterSequenceThumbProps = {
    data: any;
    colorMap;
    imageGenerator;
    domainValue;
    domainConfig;
};

export const DatasetRasterSequenceThumb = (props) => {
    let canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            props.imageGenerator(props.data, props.colorMap, canvasRef.current);
        }
    });

    return (
        <div className='raster-sequence-thumb'>
            <canvas ref={canvasRef}></canvas>
            <div>{props.domainConfig.name} = {props.domainValue} {props.domainConfig.units}</div>
        </div>
    );
};

export type DatasetRasterSequenceProps = {
    dataDomain?: DatasetVariable<number>;
    sequence: IDatasetDomainRasterSequence;
};

export const DatasetRasterSequence = (props: DatasetRasterSequenceProps) => {

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
            <DatasetRasterSequenceThumb
                key={item.x}
                domainValue={item.x}
                domainConfig={dataDomain}
                colorMap={colorMap}
                data={item.data}
                imageGenerator={props.sequence.config.imageGenerator}
            />
        );
    });

    // let thumbs = useObserver(() => props.sequence.thumbs.map((item) => {
    //     return <img key={item.x} src={item.src}></img>;
    // }));

    return (
        <div className='dataset-raster-sequence'>
            <Form layout='inline'>
                <Form.Item>
                    <NumericRangeFieldRenderer
                        value={range ? {from: range.start, to: range.end} : undefined}
                        onChange={(value) => {
                            props.sequence.setRange(value ? {start: value.from, end: value.to} : undefined);
                        }}
                        config={{
                            min: dataRange ? dataRange.min : undefined,
                            max: dataRange ? dataRange.max : undefined
                        }}
                        rendererConfig={{props: {
                            tipFormatter: (value) => {
                                return props.dataDomain ? `${value} ${props.dataDomain.units}` : value;
                            }
                        }}}
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
            {activeThumb !== -1 && range &&
                <div className='dataset-raster-sequence-player'>
                    <DatasetRasterSequenceThumb
                        domainValue={data[activeThumb].x}
                        domainConfig={dataDomain}
                        colorMap={colorMap}
                        data={data[activeThumb].data}
                        imageGenerator={props.sequence.config.imageGenerator}
                    />
                    <Slider
                        value={range.start + activeThumb}
                        min={range.start}
                        max={range.end}
                        marks={{
                            [range.start]: `${range.start} ${dataDomain ? dataDomain.units : ''}`,
                            [range.end]: `${range.end} ${dataDomain ? dataDomain.units : ''}`
                        }}
                        step={1}
                        onChange={(value) => setActiveThumb((value as number) - range!.start)}
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

DatasetAnalysisWidgetFactory.register(DOMAIN_RASTER_SEQUENCE_TYPE, (config) => {

    let analysis = config.analysis as IDatasetDomainRasterSequence;
    if (!analysis.colorMap) {
        analysis.setColorMap(analysis.config.colorMap.default);
    }

    let dataDomain = analysis.config.domain.range;
    if (!analysis.range && dataDomain) {
        analysis.setRange({
            start: dataDomain.min,
            end: dataDomain.max
        });
    }

    return <DatasetRasterSequence
        sequence={analysis}
        dataDomain={analysis.config.domain}
    />;
});
