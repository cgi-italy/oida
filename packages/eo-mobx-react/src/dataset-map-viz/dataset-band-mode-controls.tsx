import React, { useState } from 'react';

import { Select } from 'antd';

import { useSelector } from '@oida/ui-react-mobx';
import {
    RasterBandModeType, RasterBandMode, RasterBandModeConfig, getRasterBandModeFromConfig,
    RasterBandModeSingle, RasterBandModePreset, RasterBandModeCombination
} from '@oida/eo-mobx';

import { DatasetBandSingleSelector } from './dataset-band-single-selector';
import { DatasetBandPresetSelector } from './dataset-band-preset-selector';
import { DatasetBandCombinationSelector } from './dataset-band-combination-selector';


const BandModeTitles = {
    [RasterBandModeType.Single]: 'Single band',
    [RasterBandModeType.Preset]: 'Band combination preset',
    [RasterBandModeType.Combination]: 'Custom band combination',
    [RasterBandModeType.Formula]: 'Band math',
};

export type DatasetBandModeSelectorProps = {
    bandMode: RasterBandMode,
    bandModeConfig: RasterBandModeConfig
};

export const DatasetBandModeSelector = (props: DatasetBandModeSelectorProps) => {

    const [isLoading, setIsLoading] = useState(false);

    const modes = props.bandModeConfig.supportedModes;

    const selectedMode = useSelector(() => {
        return props.bandMode.value?.type;
    });

    const modeOptions = modes.map((item) => {
        return (<Select.Option key={item.type} value={item.type}>{BandModeTitles[item.type]}</Select.Option>);
    });

    const onModeSelection = (mode: RasterBandModeType) => {
        setIsLoading(true);
        getRasterBandModeFromConfig({
            config: props.bandModeConfig,
            mode: mode
        }).then((bandModeProps) => {
            props.bandMode.setValue(bandModeProps);
        }).finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className='dataset-band-mode-selector dataset-combo-selector'>
            <span>Mode: </span>
            <Select
                value={selectedMode}
                placeholder='Select mode'
                onChange={onModeSelection}
                loading={isLoading}
            >
                {modeOptions}
            </Select>
        </div>
    );
};


export type DatasetBandModeControlsProps = {
    bandMode: RasterBandMode,
    bandModeConfig: RasterBandModeConfig
};

export const DatasetBandModeControls = (props: DatasetBandModeControlsProps) => {

    const selectedMode = useSelector(() => {
        return props.bandMode.value;
    });

    let bandModeSelector: JSX.Element | undefined;
    if (props.bandModeConfig.supportedModes.length > 1) {
        bandModeSelector = (
            <DatasetBandModeSelector
                bandMode={props.bandMode}
                bandModeConfig={props.bandModeConfig}
            />
        );
    }

    return (
        <div className='dataset-band-mode-controls'>
            {bandModeSelector}
            {selectedMode instanceof RasterBandModeSingle &&
                <DatasetBandSingleSelector
                    rasterBands={props.bandModeConfig.bands!}
                    state={selectedMode}
                    bandSelectorLabel={bandModeSelector ? 'Band' : 'Variable'}
                />
            }
            {selectedMode instanceof RasterBandModePreset &&
                <DatasetBandPresetSelector
                    state={selectedMode}
                    presets={props.bandModeConfig.presets!}
                />
            }
            {selectedMode instanceof RasterBandModeCombination &&
                <DatasetBandCombinationSelector
                    bandCombo={selectedMode}
                    bands={props.bandModeConfig.bands!}
                    bandGroups={props.bandModeConfig.bandGroups}
                />
            }
        </div>
    );
};
