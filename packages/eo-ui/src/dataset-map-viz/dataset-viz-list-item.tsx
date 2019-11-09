import React, { useState } from 'react';

import { isAlive, getParentOfType } from 'mobx-state-tree';
import { useObserver } from 'mobx-react-lite';

import { List, Button, Icon, Badge, Tooltip, message } from 'antd';
import { SortableHandle } from 'react-sortable-hoc';

import { IDatasetMapViz, DatasetsExplorer } from '@oida/eo';

import { DatasetVizProgressControl } from './dataset-viz-progress-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';


export type DatasetVizListItemProps = {
    datasetViz: IDatasetMapViz;
};

export const DatasetVizListItem = (props: DatasetVizListItemProps) => {

    let vizState = useObserver(() => {

        if (!isAlive(props.datasetViz)) {
           return {
                name: '',
                tileLayer: undefined,
                visible: true
            };
        }

        let tileLayer = props.datasetViz.mapLayer;

        if (tileLayer) {
            return {
                name: props.datasetViz.dataset.config.name,
                tileLayer: tileLayer,
                visible: tileLayer.visible,
                color: props.datasetViz.dataset.config.color
            };
        } else {
            return {
                name: '',
                tileLayer: undefined,
                visible: true
            };
        }
    });

    let [activeAction, setActiveAction] = useState<string>();

    let actions = [
        {
            id: 'timeZoom',
            icon: <Icon type='clock-circle'></Icon>,
            title: 'Zoom to dataset time extent',
            callback: () => {
                let dataset = props.datasetViz.dataset;
                if (dataset.config.timeDistribution) {
                    dataset.config.timeDistribution.provider.getTimeExtent(dataset.searchParams.data.filters).then((range) => {
                        if (range) {
                            let datasetExplorer = getParentOfType(dataset, DatasetsExplorer);
                            if (datasetExplorer) {
                                datasetExplorer.timeExplorer.visibleRange.makeRangeVisible(
                                    new Date(range.start), new Date(range.end!), 0.1, true
                                );
                            }
                        } else {
                            message.warning('No data available in the selected area');
                        }
                    });
                }
            }
        },
        {
            id: 'areaZoom',
            icon: <Icon type='fullscreen-exit'></Icon>,
            title: 'Zoom to dataset area',
            callback: () => {
                let dataset = props.datasetViz.dataset;
                /*
                dataset.config!.spatialExtentGetter(dataset.productSearchParams.data.filters).then((extent) => {
                    if (extent) {
                        let datasetExplorer = getParentOfType(dataset, DatasetExplorer);
                        if (datasetExplorer) {
                            datasetExplorer.visibleTimeRange.makeRangeVisible(new Date(range.start), new Date(range.end!), 0.1, true);
                        }
                    } else {
                        message.warning('No data available in the selected area');
                    }
                });
                */
            }
        },
        {
            id: 'settings',
            icon: <Icon type='setting'></Icon>,
            title: 'Toggle visualization settings',
            content: DatasetVizSettingsFactory.create(props.datasetViz.datasetMapVizType, {
                datasetViz: props.datasetViz
            }),
            callback: () => {
                if (activeAction !== 'settings') {
                    setActiveAction('settings');
                } else {
                    setActiveAction(undefined);
                }
            }
        },
        {
            id: 'tools',
            icon: <Icon type='bar-chart'></Icon>,
            title: 'Toggle dataset tools',
            content: <div>Analytics tools</div>,
            callback: () => {
                if (activeAction !== 'tools') {
                    setActiveAction('tools');
                } else {
                    setActiveAction(undefined);
                }
            }
        }
    ];


    let DragHandle = SortableHandle(() => <div className='viz-drag-button'><Icon type='drag'></Icon></div>);


    return (
        <List.Item
        >
            <div className='viz-item-content'>
                <DragHandle/>
                <Button
                    size='small'
                    type='link'
                    onClick={() => {
                        // @ts-ignore
                        vizState.tileLayer.setVisible(!vizState.visible);
                    }}
                >
                    <Icon type={vizState.visible ? 'eye' : 'eye-invisible'}></Icon>
                </Button>
                <Badge color={vizState.color}></Badge>
                <div className='viz-item-name'>{vizState.name}</div>
                <div className='viz-item-actions'>
                {
                    actions.map((action) => {
                        return (
                            <Tooltip title={action.title} key={action.id}>
                                <Button
                                    size='small'
                                    type={action.id === activeAction ? 'primary' : 'link'}
                                    onClick={() => action.callback()}
                                >
                                    {action.icon}
                                </Button>
                            </Tooltip>
                        );
                    })
                }
                </div>
            </div>
            <DatasetVizProgressControl
                datasetViz={props.datasetViz}
            />
            {actions.filter((action) => action.id === activeAction).map((action) => {
                return (
                    <div key={action.id} className='viz-item-pane'>
                        {action.content}
                    </div>
                );
            })}
        </List.Item>
    );
};