import React, { useMemo } from 'react';
import classnames from 'classnames';
import { useDrag, useDrop } from 'react-dnd';

import { Avatar, Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { AoiValue, formatNumber, getColorFromString } from '@oidajs/core';
import { Map } from '@oidajs/state-mobx';
import {
    RasterBandModeCombination,
    RasterBandConfig,
    RasterBandGroup,
    BandScalingMode,
    DomainRange,
    isValueDomain,
    DatasetDimensions,
    isDomainProvider,
    computeRasterDatasetOptimalBandRange
} from '@oidajs/eo-mobx';
import { AdjustSolidIcon, AsyncButton, NumericRangeFieldRenderer } from '@oidajs/ui-react-antd';
import { useSelector } from '@oidajs/ui-react-mobx';

import { useDatasetVariableDomain } from '../hooks';

const DatasetBandDnDType = 'DATASET_BAND';
type DatasetBandDnDItem = {
    id: string;
};

type DatasetBandItemProps = {
    band: RasterBandConfig;
};

const DatasetBandItem = (props: DatasetBandItemProps) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: DatasetBandDnDType,
        item: { id: props.band.id },
        collect: (monitor) => {
            return {
                isDragging: monitor.isDragging()
            };
        }
    }));

    const { id, name, color } = props.band;

    const label = name.length <= 5 ? name : `B${id.substr(0, 4)}`;
    const backgroundColor = color || getColorFromString(name, 0.7, 0.4);

    return (
        <div
            className={classnames('dataset-band-item', {
                'is-dragging': isDragging
            })}
            ref={drag}
            title={name}
        >
            <Avatar size='large' style={{ backgroundColor: backgroundColor }}>
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
    const [{ isHover, canDrop }, drop] = useDrop(
        () => ({
            accept: [DatasetBandDnDType],
            collect: (monitor) => ({
                isHover: monitor.isOver(),
                canDrop: monitor.canDrop()
            }),
            canDrop: (item) => {
                return !!item.id && item.id !== props.band.id;
            },
            drop: (item: DatasetBandDnDItem) => {
                props.onBandDrop(item.id);
            }
        }),
        [props.band]
    );

    const { id, name, color } = props.band;

    const label = name.length <= 5 ? name : `B${id.substr(0, 4)}`;
    const backgroundColor = color || getColorFromString(name, 0.7, 0.4);

    return (
        <div
            className={classnames('dataset-channel-item', {
                'can-drop': canDrop,
                'is-hover': isHover
            })}
        >
            <div className='dataset-channel-item-label'>{props.channel}:</div>
            <div className='dataset-channel-item-target' ref={drop} title={name}>
                <Avatar size={50} style={{ backgroundColor: backgroundColor }}>
                    {label}
                </Avatar>
            </div>
        </div>
    );
};

export type DatasetBandScalingSelectorProps = {
    bandCombo: RasterBandModeCombination;
    redBand: RasterBandConfig;
    greenBand: RasterBandConfig;
    blueBand: RasterBandConfig;
    dimensionsState?: DatasetDimensions;
    mapState?: Map;
};

export const DatasetBandScalingSelector = (props: DatasetBandScalingSelectorProps) => {
    const bandScaling = useSelector(() => {
        return {
            mode: props.bandCombo.bandScalingMode,
            dataRange: props.bandCombo.dataRange,
            redRange: props.bandCombo.redRange,
            greenRange: props.bandCombo.greenRange,
            blueRange: props.bandCombo.blueRange
        };
    });
    if (props.bandCombo.config.supportBandScalingMode === BandScalingMode.None) {
        return null;
    }

    if (props.bandCombo.config.supportBandScalingMode === BandScalingMode.Channel) {
        //TODO: handle channel case
    }

    let redRange: DomainRange<number> | undefined;
    let greenRange: DomainRange<number> | undefined;
    let blueRange: DomainRange<number> | undefined;
    let dataRange: DomainRange<number> | undefined;

    const redDomain = useDatasetVariableDomain({
        variable: props.redBand
    });
    const greenDomain = useDatasetVariableDomain({
        variable: props.greenBand
    });
    const blueDomain = useDatasetVariableDomain({
        variable: props.blueBand
    });

    if (redDomain && isValueDomain(redDomain) && redDomain.min !== undefined && redDomain.max !== undefined) {
        redRange = {
            min: redDomain.min,
            max: redDomain.max
        };
        dataRange = redRange;
    }

    if (greenDomain && isValueDomain(greenDomain) && greenDomain.min !== undefined && greenDomain.max !== undefined) {
        greenRange = {
            min: greenDomain.min,
            max: greenDomain.max
        };

        dataRange = dataRange
            ? {
                  min: Math.min(dataRange.min, greenRange.min),
                  max: Math.max(dataRange.max, greenRange.max)
              }
            : greenRange;
    }

    if (blueDomain && isValueDomain(blueDomain) && blueDomain.min !== undefined && blueDomain.max !== undefined) {
        blueRange = {
            min: blueDomain.min,
            max: blueDomain.max
        };

        dataRange = dataRange
            ? {
                  min: Math.min(dataRange.min, blueRange.min),
                  max: Math.max(dataRange.max, blueRange.max)
              }
            : blueRange;
    }

    const redDomainProvider = props.redBand.domain && isDomainProvider(props.redBand.domain) ? props.redBand.domain : undefined;
    const greenDomainProvider = props.greenBand.domain && isDomainProvider(props.greenBand.domain) ? props.greenBand.domain : undefined;
    const blueDomainProvider = props.blueBand.domain && isDomainProvider(props.blueBand.domain) ? props.blueBand.domain : undefined;

    let autoAdjustRangeBtn: JSX.Element | undefined;
    if (dataRange && redDomainProvider && greenDomainProvider && blueDomainProvider && props.dimensionsState) {
        autoAdjustRangeBtn = (
            <AsyncButton
                className='dataset-range-adjust-btn'
                tooltip='Adjust range based on current visible data domain'
                onClick={() => {
                    const mapViewport = props.mapState?.renderer.implementation?.getViewportExtent();
                    const aoi: AoiValue | undefined = mapViewport
                        ? {
                              geometry: {
                                  type: 'BBox',
                                  bbox: mapViewport
                              }
                          }
                        : undefined;

                    return computeRasterDatasetOptimalBandRange({
                        filters: {
                            aoi: aoi,
                            additionaFilters: props.dimensionsState?.additionalFilters,
                            dimensionValues: props.dimensionsState?.dimensionValues,
                            toi: props.dimensionsState?.toi
                        },
                        bandDomainProviders: [redDomainProvider, greenDomainProvider, blueDomainProvider]
                    }).then((range) => {
                        if (range) {
                            props.bandCombo.setDataRange({
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
        );
    }
    return (
        <div className='dataset-band-scaling-selector' style={{ padding: '10px' }}>
            <span>Data range:</span>
            <NumericRangeFieldRenderer
                config={dataRange ? { min: dataRange.min, max: dataRange.max } : {}}
                value={
                    bandScaling.dataRange
                        ? {
                              from: bandScaling.dataRange.min,
                              to: bandScaling.dataRange.max
                          }
                        : undefined
                }
                onChange={(value) => {
                    props.bandCombo.setDataRange(
                        value
                            ? {
                                  min: value.from,
                                  max: value.to
                              }
                            : undefined
                    );
                }}
                sliderExtraContent={autoAdjustRangeBtn}
            />
        </div>
    );
};

export type DatasetBandCombinationSelectorProps = {
    bands: RasterBandConfig[];
    bandGroups?: RasterBandGroup[];
    bandCombo: RasterBandModeCombination;
    dimensionsState?: DatasetDimensions;
    mapState?: Map;
};

type BandConfigMap = Record<string, RasterBandConfig>;

export const DatasetBandCombinationSelector = (props: DatasetBandCombinationSelectorProps) => {
    const selectedBands = useSelector(() => {
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
            const bandItems = group.bandIndices.map((idx) => {
                const band = props.bands[idx];
                return <DatasetBandItem band={band} key={band.id} />;
            });

            return (
                <div className='dataset-band-group' key={group.id}>
                    <div className='dataset-band-items'>{bandItems}</div>
                    <div className='dataset-band-group-label'>
                        {group.name}
                        {group.units ? ` (${group.units})` : ''}
                    </div>
                </div>
            );
        });
    } else {
        const bandItems = props.bands.map((band) => {
            return <DatasetBandItem band={band} key={band.id} />;
        });
        bandGroupItems = [
            <div className='dataset-band-group' key='all-bands'>
                <div className='dataset-band-items'>{bandItems}</div>
            </div>
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
            <DatasetBandScalingSelector
                bandCombo={props.bandCombo}
                redBand={bandConfigMap[selectedBands.red]}
                greenBand={bandConfigMap[selectedBands.green]}
                blueBand={bandConfigMap[selectedBands.blue]}
                mapState={props.mapState}
                dimensionsState={props.dimensionsState}
            />
        </div>
    );
};
