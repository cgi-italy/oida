import React, { useMemo } from 'react';
import classnames from 'classnames';
import { useDrag, useDrop } from 'react-dnd';

import { useObserver } from 'mobx-react';

import { Avatar, Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { IBandMathCombination, DatasetBand, DatasetBandGroup, getFlattenDatasetBands } from '@oida/eo';

const DatasetBandDnDType = 'DATASET_BAND';
type DatasetBandDnDItem = {
    id: string,
    type: typeof DatasetBandDnDType
};

type DatasetBandItemProps = {
    band: DatasetBand;
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

    return (
        <div
            className={classnames('dataset-band-item', {
                'is-dragging': isDragging
            })}
            ref={drag}
        >
            <Avatar size='large' style={{backgroundColor: props.band.color}}
            >
                {props.band.name}
            </Avatar>
        </div>
    );
};

type DatasetChannelItemProps = {
    channel: string;
    band: DatasetBand;
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

    return (
        <div className={classnames('dataset-channel-item', {
            'can-drop': canDrop,
            'is-hover': isHover
        })}>
            <div className='dataset-channel-item-label'>
                {props.channel}:
            </div>
            <div className='dataset-channel-item-target' ref={drop}>
                <Avatar size={50} style={{backgroundColor: props.band.color}}
                >
                    {props.band.name}
                </Avatar>
            </div>
        </div>
    );

};

export type DatasetBandCombinationSelectorProps = {
    bandGroups: DatasetBandGroup[];
    bandMath: IBandMathCombination;
};

type BandConfigMap = Record<string, DatasetBand>;

export const DatasetBandCombinationSelector = (props: DatasetBandCombinationSelectorProps) => {

    let selectedBands = useObserver(() => {
        return {
            red: props.bandMath.red,
            green: props.bandMath.green,
            blue: props.bandMath.blue
        };
    });


    const bandConfigMap = useMemo(() => {
        const bands = getFlattenDatasetBands(props.bandGroups);

        return bands.reduce((bandMap: BandConfigMap, band) => {
            return {
                ...bandMap,
                [band.id]: band
            };
        }, {});
    }, [props.bandGroups]);

    const bandGroupItems = props.bandGroups.map((group) => {
        let bandItems = group.bands.map((band) => {
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

    return (
        <div className='dataset-band-combination-selector'>
            <div className='dataset-band-combination-channels'>
                <DatasetChannelItem
                    band={bandConfigMap[selectedBands.red]}
                    channel='R'
                    onBandDrop={(band) => props.bandMath.setRed(band)}
                />
                <DatasetChannelItem
                    band={bandConfigMap[selectedBands.green]}
                    channel='G'
                    onBandDrop={(band) => props.bandMath.setGreen(band)}
                />
                <DatasetChannelItem
                    band={bandConfigMap[selectedBands.blue]}
                    channel='B'
                    onBandDrop={(band) => props.bandMath.setBlue(band)}
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
