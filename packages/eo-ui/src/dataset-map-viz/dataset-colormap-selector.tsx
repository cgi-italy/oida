import React, { useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { Instance } from 'mobx-state-tree';

import { useObserver } from 'mobx-react';

import { Button, Dropdown, InputNumber, Slider, Checkbox, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { ColorMap, DataVar, ColorMapConfigPreset } from '@oida/eo';

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
    colorMap: Instance<typeof ColorMap>;
    variables: DataVar | DataVar[];
};

export const DatasetColormapPresetSelector = (props: DatasetColormapPresetSelectorProps) => {

    let [dropDownVisible, setDropDownVisible] = useState(false);

    let selectedPreset = useObserver(() => {
        return props.colorMap.preset;
    });

    let selectedVariable = useObserver(() => {
        return props.colorMap.variable;
    });

    let selectedPresetConfig = props.presets.find(preset => preset.id === selectedPreset);

    let dataVar = props.variables instanceof Array
        ? props.variables.find((variable) => variable.id === selectedVariable)
        : props.variables;

    let dataVarOptions: any = undefined;
    if (props.variables instanceof Array) {
        dataVarOptions = props.variables.map((variable) => {
            return (<Select.Option key={variable.id} value={variable.id}>{variable.name}</Select.Option>);
        });
    }

    let rangeStep = (dataVar!.domain.max - dataVar!.domain.min) / 100;

    let domain = useObserver(() => props.colorMap.mode === 'custom' ? props.colorMap.domain : undefined);
    let clamp = useObserver(() => props.colorMap.mode === 'custom' ? props.colorMap.clamp : undefined);

    let marks = {
        [dataVar!.domain.min]: `${dataVar!.domain.min} ${dataVar!.units || ''}`,
        [dataVar!.domain.max]: `${dataVar!.domain.max} ${dataVar!.units || ''}`,
    };

    return (
        <div className='dataset-colormap-selector'>
            {dataVarOptions &&
                <div className='dataset-var-selector'>
                    <span>Variable: </span>
                    <Select
                        value={selectedVariable}
                        onChange={(variable) => {
                            props.colorMap.setVariable(variable);
                            if (props.colorMap.mode === 'custom') {
                                let varConfig = (props.variables as DataVar[]).find(v => v.id === variable);
                                if (varConfig) {
                                    props.colorMap.setDomain(varConfig.domain);
                                    props.colorMap.setNoDataValue(varConfig.domain.noDataValue);
                                }
                            }
                        }}
                    >
                        {dataVarOptions}
                    </Select>
                </div>
            }
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
            {
                domain &&
                <div className='dataset-colormap-range'>
                    <div className='dataset-colormap-range-inputs'>
                        <InputNumber
                            value={domain.min}
                            min={dataVar!.domain.min}
                            max={dataVar!.domain.max}
                            step={rangeStep}
                            size='small'
                            formatter={value => `${clamp ? '≤ ' : ''}${value}`}
                            onChange={(value) => {
                                if (props.colorMap.mode === 'custom' && typeof(value) === 'number') {
                                    props.colorMap.setDomain({min: value, max: Math.max(value, props.colorMap.domain.max)});
                                }
                            }}
                        />
                        <InputNumber
                            value={domain.max}
                            min={dataVar!.domain.min}
                            max={dataVar!.domain.max}
                            onChange={(value) => {
                                if (props.colorMap.mode === 'custom' && typeof(value) === 'number') {
                                    props.colorMap.setDomain({min: Math.min(props.colorMap.domain.min, value), max: value});
                                }
                            }}
                            step={rangeStep}
                            size='small'
                            formatter={value => `${clamp ? '≥ ' : ''}${value}`}
                        />
                    </div>
                    <Slider
                        value={[domain.min, domain.max]}
                        min={dataVar!.domain.min}
                        max={dataVar!.domain.max}
                        step={rangeStep}
                        range={true}
                        marks={marks}
                        tooltipVisible={false}
                        onChange={(value) => {
                            if (props.colorMap.mode === 'custom') {
                                props.colorMap.setDomain({min: value[0], max: value[1]});
                            }
                        }}
                    />
                    <Checkbox
                        checked={clamp}
                        onChange={(evt) => {
                            if (props.colorMap.mode === 'custom') {
                                props.colorMap.setClamp(evt.target.checked);
                            }
                        }}
                    >Clamp to min/max</Checkbox>
                </div>
            }
        </div>
    );

};
