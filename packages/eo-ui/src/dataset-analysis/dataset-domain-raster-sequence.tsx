import React, { useState, useRef, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { getSnapshot } from 'mobx-state-tree';

import { Checkbox, Slider, Form } from 'antd';

import { IDatasetAnalysis, IDatasetDomainRasterSequence, DOMAIN_RASTER_SEQUENCE_TYPE, DatasetVariable, isValueDomain } from '@oida/eo';
import { NumericRangeFieldRenderer } from '@oida/ui-react-antd';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';
import { AnalysisAoiFilter } from './analysis-aoi-filter';
import { AnalysisLoadingStateMessage } from './analysis-loading-state-message';

import { DatasetColormapSelector } from '../dataset-map-viz/dataset-colormap-selector';


export type DatasetDomainRasterSequenceThumbProps = {
    data: any;
    colorMap;
    imageGenerator;
    domainValue;
    domainConfig;
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
            <div>{props.domainConfig.name} = {props.domainValue} {props.domainConfig.units}</div>
        </div>
    );
};

export type DatasetDomainRasterSequenceProps = {
    dataDomain: DatasetVariable<number>;
    sequence: IDatasetDomainRasterSequence;
    analysis: IDatasetAnalysis
};

export const DatasetDomainRasterSequence = (props: DatasetDomainRasterSequenceProps) => {

    let [activeThumb, setActiveThumb] = useState(-1);

    let dataDomain = props.dataDomain;

    const range = useObserver(() => props.sequence.range);

    let colorMap = useObserver(() => {
        return props.sequence.colorMap ? getSnapshot(props.sequence.colorMap) : undefined;
    });

    let data =  useObserver(() => props.sequence.data);

    let thumbs = data.map((item) => {
        return (
            <DatasetDomainRasterSequenceThumb
                key={item.x}
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
            min: props.dataDomain.domain.min,
            max: props.dataDomain.domain.max
        };
    }
    return (
        <div className='dataset-raster-sequence'>
            <Form layout='inline' size='small'>
                <Form.Item>
                    <NumericRangeFieldRenderer
                        value={range ? {from: range.min, to: range.max} : undefined}
                        onChange={(value) => {
                            props.sequence.setRange(value ? {min: value.from, max: value.to} : undefined);
                        }}
                        config={rangeConfig}
                        rendererConfig={{props: {
                            tipFormatter: (value) => {
                                return props.dataDomain ? `${value} ${props.dataDomain.units}` : value;
                            }
                        }}}
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
                initMessage='Specify an area and a height range to retrieve the data'
            />
            {activeThumb !== -1 && range &&
                <div className='dataset-raster-sequence-player'>
                    <DatasetDomainRasterSequenceThumb
                        domainValue={data[activeThumb].x}
                        domainConfig={dataDomain}
                        colorMap={colorMap}
                        data={data[activeThumb].data}
                        imageGenerator={props.sequence.config.imageGenerator}
                    />
                    <Slider
                        value={range.min + activeThumb}
                        min={range.min}
                        max={range.max}
                        marks={{
                            [range.min]: `${range.min} ${dataDomain ? dataDomain.units : ''}`,
                            [range.max]: `${range.max} ${dataDomain ? dataDomain.units : ''}`
                        }}
                        step={1}
                        onChange={(value) => setActiveThumb((value as number) - range.min)}
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

    let analysis = config.analysis as IDatasetAnalysis;
    let rasterSequence = analysis.datasetViz as IDatasetDomainRasterSequence;
    if (!rasterSequence.colorMap) {
        rasterSequence.setColorMap(rasterSequence.config.colorMap.default);
    }

    let dataDomain = rasterSequence.config.domain;
    if (!rasterSequence.range && dataDomain.domain && isValueDomain(dataDomain.domain)) {
        rasterSequence.setRange({
            min: dataDomain.domain.min,
            max: dataDomain.domain.max
        });
    }

    return <DatasetDomainRasterSequence
        analysis={analysis}
        sequence={rasterSequence}
        dataDomain={rasterSequence.config.domain}
    />;
});
