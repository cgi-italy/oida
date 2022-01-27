import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { Button, Dropdown, InputNumber, Slider, Checkbox, Tooltip } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { formatNumber } from '@oidajs/core';
import { Map } from '@oidajs/state-mobx';
import {
    ColorMap,
    ColorScale,
    NumericVariable,
    ColorScaleType,
    isValueDomain,
    NumericDomainMapper,
    DatasetDimensions,
    isDomainProvider,
    computeRasterDatasetOptimalBandRange
} from '@oidajs/eo-mobx';
import { AdjustSolidIcon, AsyncButton } from '@oidajs/ui-react-antd';
import { useSelector } from '@oidajs/ui-react-mobx';

import { useDatasetVariableDomain } from '../hooks';

export type DatasetColorScaleSelectorItemProps = {
    colorScale: ColorScale;
};

export const DatasetColorScaleSelectorItem = (props: DatasetColorScaleSelectorItemProps) => {
    const legendRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (legendRef.current) {
            legendRef.current.innerHTML = '';
            legendRef.current.appendChild(props.colorScale.legend.cloneNode(false));
        }
    }, [legendRef.current, props.colorScale]);

    return (
        <React.Fragment>
            <div className='dataset-colormap-preset-content'>
                <div className='dataset-colormap-preset-title'>{props.colorScale.name}</div>
                <div className='dataset-colormap-preset-legend' ref={legendRef}></div>
            </div>
        </React.Fragment>
    );
};

export type DatasetColorScaleListProps = {
    colorScales: ColorScale[];
    selectedColorScale: string | undefined;
    onColorScaleSelect: (preset: string) => void;
};

export const DatasetColorScaleList = (props: DatasetColorScaleListProps) => {
    const presetItems = props.colorScales.map((colorScale) => {
        return (
            <div
                className={classnames('dataset-colormap-preset', { selected: colorScale.id === props.selectedColorScale })}
                onClick={() => props.onColorScaleSelect(colorScale.id)}
                key={colorScale.id}
            >
                <DatasetColorScaleSelectorItem colorScale={colorScale} />
            </div>
        );
    });

    return <div className='dataset-colormap-presets'>{presetItems}</div>;
};

export type DatasetColorScaleSelectorProps = {
    colorScales: ColorScale[];
    colorMap: ColorMap;
};

export const DatasetColorScaleSelector = (props: DatasetColorScaleSelectorProps) => {
    const [dropDownVisible, setDropDownVisible] = useState(false);

    const selectedColorScale = useSelector(() => {
        return props.colorMap.colorScale;
    });

    const selectedColorScaleConfig = props.colorScales.find((colorScale) => colorScale.id === selectedColorScale);

    return (
        <Dropdown
            trigger={['click']}
            placement='bottomLeft'
            onVisibleChange={(visible) => setDropDownVisible(visible)}
            visible={dropDownVisible}
            overlayClassName='dataset-colormap-preset-dropdown'
            overlay={
                <DatasetColorScaleList
                    colorScales={props.colorScales}
                    selectedColorScale={selectedColorScale}
                    onColorScaleSelect={(colorScale) => {
                        props.colorMap.setColorScale(colorScale);
                        setDropDownVisible(false);
                    }}
                />
            }
        >
            <div className='dataset-colormap-preset'>
                {selectedColorScaleConfig && <DatasetColorScaleSelectorItem colorScale={selectedColorScaleConfig} />}
                <Button type='link'>
                    <DownOutlined />
                </Button>
            </div>
        </Dropdown>
    );
};

export type DatasetColorMapRangeSelectorProps = {
    colorMap: ColorMap;
    variable: NumericVariable;
    dimensionsState?: DatasetDimensions;
    mapState?: Map;
};

export const DatasetColorMapRangeSelector = (props: DatasetColorMapRangeSelectorProps) => {
    const domain = useDatasetVariableDomain({
        variable: props.variable
    });

    const mapRange = useSelector(() => props.colorMap.domain?.mapRange);
    const clamp = useSelector(() => props.colorMap.domain?.clamp);

    const sliderRef = useRef<any>();

    if (!mapRange) {
        return null;
    }

    let domainSlider: JSX.Element | undefined;

    const domainMapper = new NumericDomainMapper({
        domain: domain,
        unitsSymbol: props.variable.units
    });

    const normalizedRange = {
        min: domainMapper.normalizeValue(mapRange.min),
        max: domainMapper.normalizeValue(mapRange.max)
    };

    let variableDomain: { min: number; max: number; step: number } | undefined;
    if (domain && isValueDomain(domain) && domain.min !== undefined && domain.max !== undefined) {
        const min = domainMapper.normalizeValue(domain.min);
        const max = domainMapper.normalizeValue(domain.max);
        if (min !== undefined && max !== undefined) {
            variableDomain = {
                min: parseFloat(
                    formatNumber(min, {
                        maxLength: 6
                    })
                ),
                max: parseFloat(
                    formatNumber(max, {
                        maxLength: 6
                    })
                ),
                step: domain.step ? domain.step * (domain.scale || 1) : parseFloat(((max - min) / 100).toPrecision(4))
            };
        }
    }

    if (variableDomain) {
        const marks = {
            [variableDomain.min]: `${variableDomain.min}`,
            [variableDomain.max]: `${variableDomain.max}`
        };

        domainSlider = (
            <Slider
                ref={sliderRef}
                value={[normalizedRange.min!, normalizedRange.max!]}
                min={variableDomain.min}
                max={variableDomain.max}
                step={variableDomain.step}
                range={true}
                marks={marks}
                tooltipVisible={false}
                onChange={(value) => {
                    const range = {
                        min: domainMapper.denormalizeValue(value[0]),
                        max: domainMapper.denormalizeValue(value[1])
                    };
                    if (sliderRef.current) {
                        // retrieve from the slider state which handle was moved and update only the corresponding range endpoint
                        // (to avoid rounding-off the untouched range endpoint)
                        const movedHandle: number | undefined = sliderRef.current.prevMovedHandleIndex;
                        if (movedHandle === 0) {
                            range.max = mapRange.max;
                        } else if (movedHandle === 1) {
                            range.min = mapRange.min;
                        }
                    }
                    props.colorMap.domain?.setRange(range);
                }}
            />
        );
    }

    const domainProvider = props.variable.domain && isDomainProvider(props.variable.domain) ? props.variable.domain : undefined;

    return (
        <div className='dataset-colormap-range'>
            <div className='dataset-colormap-range-inputs'>
                <InputNumber
                    value={normalizedRange.min}
                    min={variableDomain?.min}
                    max={variableDomain?.max}
                    step={variableDomain?.step}
                    size='small'
                    addonBefore={clamp ? '≤' : undefined}
                    onChange={(value) => {
                        if (typeof value === 'number') {
                            const unscaledValue = domainMapper.denormalizeValue(value);
                            if (unscaledValue !== props.colorMap.domain?.mapRange.min) {
                                props.colorMap.domain?.setRange({
                                    min: unscaledValue,
                                    max: props.colorMap.domain.mapRange.max
                                });
                            }
                        }
                    }}
                />
                {props.variable.units && <span className='dataset-colormap-units'>{props.variable.units}</span>}
                <InputNumber
                    value={normalizedRange.max}
                    min={variableDomain?.min}
                    max={variableDomain?.max}
                    step={variableDomain?.step}
                    onChange={(value) => {
                        if (typeof value === 'number') {
                            const unscaledValue = domainMapper.denormalizeValue(value);
                            if (unscaledValue !== props.colorMap.domain?.mapRange.max) {
                                props.colorMap.domain?.setRange({
                                    min: props.colorMap.domain.mapRange.min,
                                    max: unscaledValue
                                });
                            }
                        }
                    }}
                    size='small'
                    addonBefore={clamp ? '≥' : undefined}
                />
            </div>
            <div className='dataset-colormap-range-slider'>
                {domainSlider}
                {variableDomain && domainProvider && props.dimensionsState && (
                    <AsyncButton
                        tooltip='Adjust range based on current visible data domain'
                        onClick={() => {
                            const mapViewport = props.mapState?.renderer.implementation?.getViewportExtent();
                            return computeRasterDatasetOptimalBandRange({
                                filters: {
                                    aoi: mapViewport
                                        ? {
                                              geometry: {
                                                  type: 'BBox',
                                                  bbox: mapViewport
                                              }
                                          }
                                        : undefined,
                                    additionaFilters: props.dimensionsState?.additionalFilters,
                                    dimensionValues: props.dimensionsState?.dimensionValues,
                                    toi: props.dimensionsState?.toi
                                },
                                bandDomainProviders: [domainProvider]
                            }).then((range) => {
                                if (range) {
                                    props.colorMap.domain?.setRange({
                                        min: parseFloat(
                                            formatNumber(range.min, {
                                                precision: 3
                                            })
                                        ),
                                        max: parseFloat(
                                            formatNumber(range.max, {
                                                precision: 3
                                            })
                                        )
                                    });
                                }
                            });
                        }}
                        type='link'
                        icon={<AdjustSolidIcon />}
                    />
                )}
            </div>
            <Checkbox
                checked={!clamp}
                onChange={(evt) => {
                    props.colorMap.domain?.setClamp(!evt.target.checked);
                }}
            >
                <span>Filter to data range </span>
                <Tooltip title={'When enabled data beyond the color map range limits will be transparent on the map'}>
                    <QuestionCircleOutlined />
                </Tooltip>
            </Checkbox>
        </div>
    );
};

export type DatasetColorMapSelectorProps = {
    colorScales: ColorScale[];
    colorMap: ColorMap;
    variable?: NumericVariable;
    dimensionsState?: DatasetDimensions;
    mapState?: Map;
};

export const DatasetColorMapSelector = (props: DatasetColorMapSelectorProps) => {
    const selectedColorScale = useSelector(() => {
        return props.colorMap.colorScale;
    });

    const selectedColorScaleConfig = props.colorScales.find((colorScale) => colorScale.id === selectedColorScale);

    let colormapRangeSelector: JSX.Element | undefined;
    if (props.variable && selectedColorScaleConfig?.type === ColorScaleType.Parametric) {
        colormapRangeSelector = (
            <DatasetColorMapRangeSelector
                colorMap={props.colorMap}
                variable={props.variable}
                dimensionsState={props.dimensionsState}
                mapState={props.mapState}
            />
        );
    }

    return (
        <div className='dataset-colormap-selector'>
            <DatasetColorScaleSelector colorMap={props.colorMap} colorScales={props.colorScales} />
            {colormapRangeSelector}
        </div>
    );
};
