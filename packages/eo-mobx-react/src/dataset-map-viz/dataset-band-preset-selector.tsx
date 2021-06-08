import React, { useState } from 'react';
import classnames from 'classnames';

import { Avatar, Button, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { RasterBandModePreset, RasterBandPreset } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';

export type DatasetBandPresetSelectorItemProps = {
    preset: RasterBandPreset;
};

export const DatasetBandPresetSelectorItem = (props: DatasetBandPresetSelectorItemProps) => {
    return (
        <React.Fragment>
            <Avatar size='large' src={props.preset.preview}/>
            <div className='dataset-raster-band-preset-content'>
                <div className='dataset-raster-band-preset-title'>{props.preset.name}</div>
                <div className='dataset-raster-band-preset-description'>{props.preset.description}</div>
            </div>
        </React.Fragment>
    );
};

export type DatasetBandPresetListProps = {
    presets: RasterBandPreset[];
    selectedPreset: string | undefined;
    onPresetSelect: (preset: string) => void;
};

export const DatasetBandPresetList = (props: DatasetBandPresetListProps) => {

    let presetItems = props.presets.map((preset) => {
        return (
            <div
                className={classnames('dataset-raster-band-preset', {'selected': preset.id === props.selectedPreset})}
                onClick={() => props.onPresetSelect(preset.id)}
                key={preset.id}
            >
                <DatasetBandPresetSelectorItem preset={preset}/>
            </div>
        );
    });

    return (
        <div className='dataset-raster-band-presets'
        >
            {presetItems}
        </div>
    );
};


export type DatasetBandPresetSelectorProps = {
    presets: RasterBandPreset[];
    state: RasterBandModePreset;
};

export const DatasetBandPresetSelector = (props: DatasetBandPresetSelectorProps) => {

    let [dropDownVisible, setDropDownVisible] = useState(false);

    let selectedPreset = useSelector(() => {
        return props.state.preset;
    });

    let selectedPresetConfig = props.presets.find(preset => preset.id === selectedPreset);

    return (
        <div className='dataset-raster-band-preset-selector'>
            <Dropdown
                trigger={['click']}
                placement='bottomLeft'
                onVisibleChange={(visible) => setDropDownVisible(visible)}
                visible={dropDownVisible}
                overlay={<DatasetBandPresetList
                    presets={props.presets}
                    selectedPreset={selectedPreset}
                    onPresetSelect={(preset) => {
                        props.state.setPreset(preset);
                        setDropDownVisible(false);
                    }}
                />}
            >
                <div className='dataset-raster-band-preset'>
                    {selectedPresetConfig && <DatasetBandPresetSelectorItem
                        preset={selectedPresetConfig}
                    />}
                    <Button type='link'><DownOutlined/></Button>
                </div>
            </Dropdown>
            {selectedPresetConfig && selectedPresetConfig.legend &&
                <div className='dataset-raster-band-preset-legend'>
                    <img src={selectedPresetConfig.legend}/>
                </div>
            }
        </div>
    );
};
