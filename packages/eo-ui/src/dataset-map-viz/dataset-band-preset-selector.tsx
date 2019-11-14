import React from 'react';
import classnames from 'classnames';

import { Instance } from 'mobx-state-tree';
import { useObserver } from 'mobx-react';

import { List, Avatar, Popover, Button, Icon, Collapse, Dropdown } from 'antd';

import { BandMathConfigPreset, BandMathPreset, IDatasetRasterViz } from '@oida/eo';

export type DatasetBandPresetSelectorItemProps = {
    preset: BandMathConfigPreset;
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
    presets: BandMathConfigPreset[];
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
    presets: BandMathConfigPreset[];
    rasterView: IDatasetRasterViz;
};

export const DatasetBandPresetSelector = (props: DatasetBandPresetSelectorProps) => {

    let selectedPreset = useObserver(() => {

        try {
            let bandMath = props.rasterView.bandMath as Instance<typeof BandMathPreset>;
            return bandMath.preset;
        } catch (e) {
            return undefined;
        }
    });

    let selectedPresetConfig = props.presets.find(preset => preset.id === selectedPreset);

    return (
        <Dropdown
            trigger={['click']}
            placement='bottomLeft'

            overlay={<DatasetBandPresetList
                presets={props.presets}
                selectedPreset={selectedPreset}
                onPresetSelect={(preset) => props.rasterView.setBandMath({mode: 'preset', preset: preset})}
            />}
        >
            <div className='dataset-raster-band-preset'>
                {selectedPresetConfig && <DatasetBandPresetSelectorItem
                    preset={selectedPresetConfig}
                />}
                <Button type='link'><Icon type='down'></Icon></Button>
            </div>
        </Dropdown>
    );

    // return (
    //     <Popover
    //         trigger='click'
    //         placement='bottom'

    //         content={<DatasetBandPresetList
    //             presets={props.presets}
    //             selectedPreset={selectedPreset}
    //             onPresetSelect={(preset) => props.rasterView.setBandMath({mode: 'preset', preset: preset})}
    //         />}
    //     >
    //         <div className='dataset-raster-band-preset'>
    //             {selectedPresetConfig && <DatasetBandPresetSelectorItem
    //                 preset={selectedPresetConfig}
    //             />}
    //             <Button type='link'><Icon type='down'></Icon></Button>
    //         </div>
    //     </Popover>
    // );

    // return (
    //     <Collapse
    //         className='dataset-band-selector'
    //         bordered={false}
    //     >
    //         <Collapse.Panel
    //             key='band-selector'
    //             showArrow={false}
    //             header={
    //                 <div className='dataset-raster-band-preset'>
    //                     {selectedPresetConfig && <DatasetBandPresetSelectorItem
    //                         preset={selectedPresetConfig}
    //                     />}
    //                     <Button type='link'><Icon type='down'></Icon></Button>
    //                 </div>
    //             }
    //         >
    //             <DatasetBandPresetList
    //                 presets={props.presets}
    //                 selectedPreset={selectedPreset}
    //                 onPresetSelect={(preset) => props.rasterView.setBandMath({mode: 'preset', preset: preset})}
    //             />
    //         </Collapse.Panel>
    //     </Collapse>
    // );
};
