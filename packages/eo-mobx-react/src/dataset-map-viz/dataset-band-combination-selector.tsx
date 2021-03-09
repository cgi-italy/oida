import React, { useMemo } from 'react';
import classnames from 'classnames';
import { useDrag, useDrop } from 'react-dnd';


import { Avatar, Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { RasterBandModeCombination, RasterBandConfig, RasterBandGroup } from '@oida/eo-mobx';
import { useSelector } from '@oida/ui-react-mobx';
import { getColorFromString } from '@oida/core';


const DatasetBandDnDType = 'DATASET_BAND';
type DatasetBandDnDItem = {
    id: string,
    type: typeof DatasetBandDnDType
};

type DatasetBandItemProps = {
    band: RasterBandConfig;
};

const DatasetBandItem = (props: DatasetBandItemProps) => {
    const [{isDragging}, drag, preview] = useDrag({
        item: {type: DatasetBandDnDType, id: props.band.id},
        collect: (monitor) => {
            return {
                isDragging: monitor.isDragging()
            };
        }
    });

    const {id, name, color} = props.band;

    let label = name.length <= 5 ? name : `B${id.substr(0, 4)}`;
    let backgroundColor = color || getColorFromString(name, 0.7, 0.7);

    return (
        <div
            className={classnames('dataset-band-item', {
                'is-dragging': isDragging
            })}
            ref={drag}
            title={name}
        >
            <Avatar size='large' style={{backgroundColor: backgroundColor}}
            >
                {label}
            </Avatar>
        </div>
    );
};

type DatasetChannelItemProps = {
    channel: string;
    band: RasterBandConfig;
    onBandDrop: (band: string) => void;
};


const DatasetChannelItem = (props: DatasetChannelItemProps) => {
    const [{ isHover, canDrop }, drop] = useDrop({
        accept: [DatasetBandDnDType],
        collect: (monitor) => ({
          isHover: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
        canDrop: (item) => {
            return !!item.id && item.id !== props.band.id;
        },
        drop: (item: DatasetBandDnDItem) => {
            props.onBandDrop(item.id);
        }
    });

    const {id, name, color} = props.band;

    let label = name.length <= 5 ? name : `B${id.substr(0, 4)}`;
    let backgroundColor = color || getColorFromString(name, 0.7, 0.7);

    return (
        <div className={classnames('dataset-channel-item', {
            'can-drop': canDrop,
            'is-hover': isHover
        })}>
            <div className='dataset-channel-item-label'>
                {props.channel}:
            </div>
            <div className='dataset-channel-item-target' ref={drop} title={name}>
                <Avatar size={50} style={{backgroundColor: backgroundColor}}
                >
                    {label}
                </Avatar>
            </div>
        </div>
    );

};

export type DatasetBandCombinationSelectorProps = {
    bands: RasterBandConfig[];
    bandGroups?: RasterBandGroup[];
    bandCombo: RasterBandModeCombination;
};

type BandConfigMap = Record<string, RasterBandConfig>;

export const DatasetBandCombinationSelector = (props: DatasetBandCombinationSelectorProps) => {

    let selectedBands = useSelector(() => {
        return {
            red: props.bandCombo.red,
            green: props.bandCombo.green,
            blue: props.bandCombo.blue
        };
    });


    const bandConfigMap = useMemo(() => {
        return props.bands.reduce((bandMap: BandConfigMap, band) => {
            return {
                ...bandMap,
                [band.id]: band
            };
        }, {});
    }, [props.bands]);

    let bandGroupItems: JSX.Element[];
    if (props.bandGroups) {
        bandGroupItems = props.bandGroups.map((group) => {
            let bandItems = group.bandIndices.map((idx) => {
                let band = props.bands[idx];
                return (
                    <DatasetBandItem
                        band={band}
                        key={band.id}
                    />
                );
            });


            return (
                <div className='dataset-band-group' key={group.id}>
                    <div className='dataset-band-items'>
                        {bandItems}
                    </div>
                    <div className='dataset-band-group-label'>{group.name}{group.units ? ` (${group.units})` : ''}</div>
                </div>
            );
        });
    } else {
        let bandItems = props.bands.map((band) => {
            return (
                <DatasetBandItem
                    band={band}
                    key={band.id}
                />
            );
        });
        bandGroupItems = [
            (
                <div className='dataset-band-group' key='all-bands'>
                    <div className='dataset-band-items'>
                        {bandItems}
                    </div>
                </div>
            )
        ];
    }

    return (
        <div className='dataset-band-combination-selector'>
            <div className='dataset-band-combination-channels'>
                <DatasetChannelItem
                    band={bandConfigMap[selectedBands.red]}
                    channel='R'
                    onBandDrop={(band) => props.bandCombo.setRed(band)}
                />
                <DatasetChannelItem
                    band={bandConfigMap[selectedBands.green]}
                    channel='G'
                    onBandDrop={(band) => props.bandCombo.setGreen(band)}
                />
                <DatasetChannelItem
                    band={bandConfigMap[selectedBands.blue]}
                    channel='B'
                    onBandDrop={(band) => props.bandCombo.setBlue(band)}
                />
            </div>
            <div className='dataset-band-groups'>
                <div className='dataset-band-groups-title'>
                    <span>Dataset bands:</span>
                    <Tooltip title='Drag the bands into the RGB channels above to create your composite visualization'>
                        <Button type='link' size='small'>
                            <QuestionCircleOutlined />
                        </Button>
                    </Tooltip>
                </div>
                {bandGroupItems}
            </div>
        </div>
    );
};
