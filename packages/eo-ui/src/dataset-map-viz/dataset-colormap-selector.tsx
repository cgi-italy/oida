import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';

import { useObserver } from 'mobx-react';

import { Button, Dropdown, InputNumber, Slider, Checkbox, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { IColorMapBase, IColorMapCustom, IColorMap, DatasetVariable, ColorMapConfigPreset, ValueDomain } from '@oida/eo';

export type DatasetColormapPresetSelectorItemProps = {
    preset: ColorMapConfigPreset;
};

export const DatasetColormapPresetSelectorItem = (props: DatasetColormapPresetSelectorItemProps) => {

    let legendRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (legendRef.current) {
            legendRef.current.innerHTML = '';
            legendRef.current.appendChild(props.preset.legend.cloneNode(false));
        }
    }, [legendRef.current, props.preset]);

    return (
        <React.Fragment>
            <div className='dataset-colormap-preset-content'>
                <div className='dataset-colormap-preset-title'>{props.preset.name}</div>
                <div className='dataset-colormap-preset-legend' ref={legendRef}></div>
            </div>
        </React.Fragment>
    );
};

export type DatasetColormapPresetListProps = {
    presets: ColorMapConfigPreset[];
    selectedPreset: string | undefined;
    onPresetSelect: (preset: string) => void;
};

export const DatasetColormapPresetList = (props: DatasetColormapPresetListProps) => {

    let presetItems = props.presets.map((preset) => {
        return (
            <div
                className={classnames('dataset-colormap-preset', {'selected': preset.id === props.selectedPreset})}
                onClick={() => props.onPresetSelect(preset.id)}
                key={preset.id}
            >
                <DatasetColormapPresetSelectorItem preset={preset}/>
            </div>
        );
    });

    return (
        <div className='dataset-colormap-presets'
        >
            {presetItems}
        </div>
    );
};


export type DatasetColormapPresetSelectorProps = {
    presets: ColorMapConfigPreset[];
    colorMap: IColorMapBase;
};

export const DatasetColormapPresetSelector = (props: DatasetColormapPresetSelectorProps) => {

    let [dropDownVisible, setDropDownVisible] = useState(false);

    let selectedPreset = useObserver(() => {
        return props.colorMap.preset;
    });

    let selectedPresetConfig = props.presets.find(preset => preset.id === selectedPreset);

    return (
        <Dropdown
            trigger={['click']}
            placement='bottomLeft'
            onVisibleChange={(visible) => setDropDownVisible(visible)}
            visible={dropDownVisible}
            overlayClassName='dataset-colormap-preset-dropdown'
            overlay={<DatasetColormapPresetList
                presets={props.presets}
                selectedPreset={selectedPreset}
                onPresetSelect={(preset) => {
                    props.colorMap.setPreset(preset);
                    setDropDownVisible(false);
                }}
            />}
        >
            <div className='dataset-colormap-preset'>
                {selectedPresetConfig && <DatasetColormapPresetSelectorItem
                    preset={selectedPresetConfig}
                />}
                <Button type='link'><DownOutlined/></Button>
            </div>
        </Dropdown>
    );
};

export type DatasetColormapRangeSelectorProps = {
    colorMap: IColorMapCustom;
    variable: DatasetVariable<ValueDomain<number>>;
};

export const DatasetColormapRangeSelector = (props: DatasetColormapRangeSelectorProps) => {

    const domainConfig = props.variable.domain;

    let domain = useObserver(() => props.colorMap.domain);
    let clamp = useObserver(() => props.colorMap.clamp);

    let domainSlider: JSX.Element | undefined;

    const variableDomain = domainConfig
        ? {
            min: domainConfig.min,
            max: domainConfig.max,
            step: (domainConfig.max - domainConfig.min) / 100
        }
        : undefined;

    if (variableDomain) {

        let marks = {
            [variableDomain.min]: `${variableDomain.min}`,
            [variableDomain.max]: `${variableDomain.max}`,
        };

        domainSlider = <Slider
            value={[domain.min, domain.max]}
            min={variableDomain.min}
            max={variableDomain.max}
            step={variableDomain.step}
            range={true}
            marks={marks}
            tooltipVisible={false}
            onChange={(value) => {
                props.colorMap.setDomain({min: value[0], max: value[1]});
            }}
        />;
    }

    return (
        <div className='dataset-colormap-range'>
            <div className='dataset-colormap-range-inputs'>
                <InputNumber
                    value={domain.min}
                    min={variableDomain?.min}
                    max={variableDomain?.max}
                    step={variableDomain?.step}
                    size='small'
                    formatter={value => `${clamp ? '≤ ' : ''}${value}`}
                    onChange={(value) => {
                        if (typeof(value) === 'number') {
                            props.colorMap.setDomain({
                                min: value,
                                max: Math.max(value, props.colorMap.domain.max)
                            });
                        }
                    }}
                />
                {props.variable.units && <span>{props.variable.units}</span>}
                <InputNumber
                    value={domain.max}
                    min={variableDomain?.min}
                    max={variableDomain?.max}
                    step={variableDomain?.step}
                    onChange={(value) => {
                        if (typeof(value) === 'number') {
                            props.colorMap.setDomain({
                                min: Math.min(props.colorMap.domain.min, value),
                                max: value
                            });
                        }
                    }}
                    size='small'
                    formatter={value => `${clamp ? '≥ ' : ''}${value}`}
                />
            </div>
            {domainSlider}
            <Checkbox
                checked={clamp}
                onChange={(evt) => {
                    if (props.colorMap.mode === 'custom') {
                        props.colorMap.setClamp(evt.target.checked);
                    }
                }}
            >
                Clamp to min/max
            </Checkbox>
        </div>
    );
};

export type DatasetColormapVariableSelectorProps = {
    colorMap: IColorMap;
    variables: DatasetVariable<ValueDomain<number>>[];
};

export const DatasetColormapVariableSelector = (props: DatasetColormapVariableSelectorProps) => {

    let selectedVariable = useObserver(() => {
        return props.colorMap.variable;
    });

    const findVariableConfig = (variable: string) => {
        return props.variables.find((variableConfig) => variableConfig.id === variable);
    };

    const dataVarOptions = props.variables.map((variable) => {
        return (<Select.Option key={variable.id} value={variable.id}>{variable.name}</Select.Option>);
    });

    return (
        <div className='dataset-var-selector'>
            <span>Variable: </span>
            <Select
                value={selectedVariable}
                onChange={(variable) => {
                    props.colorMap.setVariable(variable);
                    if (props.colorMap.mode === 'custom') {
                        let varConfig = findVariableConfig(variable);
                        if (varConfig) {
                            if (varConfig.domain) {
                                props.colorMap.setDomain({
                                    min: varConfig.domain.min,
                                    max: varConfig.domain.max
                                });
                                props.colorMap.setNoDataValue(varConfig.domain.noData);
                            }
                        }
                    }
                }}
            >
                {dataVarOptions}
            </Select>
        </div>
    );
};


export type DatasetColormapSelectorProps = {
    presets: ColorMapConfigPreset[];
    colorMap: IColorMap;
    variables?: DatasetVariable<ValueDomain<number>> | DatasetVariable<ValueDomain<number>>[];
};

export const DatasetColormapSelector = (props: DatasetColormapSelectorProps) => {

    let selectedVariable = useObserver(() => {
        return props.colorMap.variable;
    });

    const variableConfig = props.variables instanceof Array
        ? props.variables.find((variable) => variable.id === selectedVariable)
        : props.variables;


    let variableSelector: JSX.Element | undefined;

    if (props.variables instanceof Array) {
        variableSelector = <DatasetColormapVariableSelector
            colorMap={props.colorMap}
            variables={props.variables}
        />;
    }

    let colormapRangeSelector: JSX.Element | undefined;
    if (variableConfig && props.colorMap.mode === 'custom') {
        colormapRangeSelector = <DatasetColormapRangeSelector
            colorMap={props.colorMap}
            variable={variableConfig}
        />;
    }

    return (
        <div className='dataset-colormap-selector'>
            {variableSelector}
            <DatasetColormapPresetSelector
                colorMap={props.colorMap}
                presets={props.presets}
            />
            {colormapRangeSelector}
        </div>
    );
};
