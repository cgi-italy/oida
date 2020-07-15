import React from 'react';
import { useObserver } from 'mobx-react';
import { SnapshotOrInstance } from 'mobx-state-tree';

import { Select } from 'antd';

import {
    BandMathInterface, IBandMath, IBandMathSingle, IBandMathPreset, IBandMathCombination,
    BandMathConfig, BandMathConfigMode, ColormapConfigMode, getFlattenDatasetBands
} from '@oida/eo';

import { DatasetBandPresetSelector } from './dataset-band-preset-selector';
import { DatasetColormapSelector } from './dataset-colormap-selector';
import { DatasetBandCombinationSelector } from './dataset-band-combination-selector';

const MultiBandModeTitles = {
    [BandMathConfigMode.Single]: 'Single band',
    [BandMathConfigMode.Presets]: 'Band combination preset',
    [BandMathConfigMode.Combination]: 'Custom band combination',
    [BandMathConfigMode.Formula]: 'Band math',
};

export type WithBandMath = {
    bandMath?: IBandMath,
    setBandMath: (bandMath: SnapshotOrInstance<BandMathInterface>) => void
};

export type DatasetMultiBandModeSelectorProps = {
    dataset: WithBandMath,
    bandMathConfig: BandMathConfig
};

export const DatasetMultiBandModeSelector = (props: DatasetMultiBandModeSelectorProps) => {

    const modes = props.bandMathConfig.supportedModes;

    const selectedMode = useObserver(() => {
        return props.dataset.bandMath?.mode;
    });

    const modeOptions = modes.map((item) => {
        return (<Select.Option key={item} value={item}>{MultiBandModeTitles[item]}</Select.Option>);
    });

    const onModeSelection = (mode: string) => {

        const bandGroups = props.bandMathConfig.bandGroups;

        switch (mode) {
            case BandMathConfigMode.Single:
                const colorMaps = props.bandMathConfig.singleBandColorMaps;
                if (bandGroups && colorMaps) {
                    const defaultBand = bandGroups[0].bands[0];
                    if (defaultBand && defaultBand.domain) {
                        props.dataset.setBandMath({
                            mode: BandMathConfigMode.Single,
                            colorMap: {
                                variable: defaultBand.id,
                                mode: ColormapConfigMode.Customizable,
                                preset: colorMaps[0].id,
                                domain: defaultBand.domain
                            }
                        });
                    }
                }
                break;
            case BandMathConfigMode.Presets:
                const presets = props.bandMathConfig.presets;
                if (presets) {
                    props.dataset.setBandMath({
                        mode: BandMathConfigMode.Presets,
                        preset: presets[0].id
                    });
                }
                break;
            case BandMathConfigMode.Combination:
                if (bandGroups) {
                    const bands = bandGroups[0].bands;
                    props.dataset.setBandMath({
                        mode: BandMathConfigMode.Combination,
                        red: bands[0].id,
                        green: bands[1].id,
                        blue: bands[2].id
                    });
                }
                break;
        }
    };

    return (
        <div className='dataset-multiband-mode-selector dataset-combo-selector'>
            <span>Mode: </span>
            <Select
                value={selectedMode}
                placeholder='Select mode'
                onChange={onModeSelection}
            >
                {modeOptions}
            </Select>
        </div>
    );
};


export type DatasetMultibandControlsProps = {
    dataset: WithBandMath,
    bandMathConfig: BandMathConfig
};

export const DatasetMultiBandControls = (props: DatasetMultibandControlsProps) => {

    const selectedMode = useObserver(() => {
        return props.dataset.bandMath?.mode;
    });

    const bands = getFlattenDatasetBands(props.bandMathConfig.bandGroups || []);

    return (
        <div className='dataset-multiband-controls'>
            <DatasetMultiBandModeSelector
                dataset={props.dataset}
                bandMathConfig={props.bandMathConfig}
            />
            {selectedMode === BandMathConfigMode.Single &&
                <DatasetColormapSelector
                    colorMap={(props.dataset.bandMath as IBandMathSingle).colorMap}
                    presets={props.bandMathConfig.singleBandColorMaps!}
                    variables={bands}
                    variableSelectorLabel='Band'
                />
            }
            {selectedMode === BandMathConfigMode.Presets &&
                <DatasetBandPresetSelector
                    bandMath={props.dataset.bandMath as IBandMathPreset}
                    presets={props.bandMathConfig.presets || []}
                />
            }
            {selectedMode === BandMathConfigMode.Combination &&
                <DatasetBandCombinationSelector
                    bandMath={props.dataset.bandMath as IBandMathCombination}
                    bandGroups={props.bandMathConfig.bandGroups!}
                />
            }
        </div>
    );
};

