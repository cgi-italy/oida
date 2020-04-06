import React, { useState } from 'react';

import { isAlive, getParentOfType } from 'mobx-state-tree';
import { useObserver } from 'mobx-react';

import { List, Button, Icon, Badge, Tooltip, message } from 'antd';
import { SortableHandle } from 'react-sortable-hoc';

import { useCenterOnMapFromModule } from '@oida/ui-react-mst';
import { IDatasetViz, DatasetsExplorer } from '@oida/eo';


import { DatasetVizProgressControl } from './dataset-viz-progress-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetTools } from './dataset-tools';
import { DatasetVizDownloadModal } from './dataset-viz-download';

export type DatasetVizListItemProps = {
    datasetViz: IDatasetViz;
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
    let [downloadVisible, setDownloadVisible] = useState(false);

    let centerOnMap = useCenterOnMapFromModule();

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
                if (dataset.config.spatialCoverageProvider) {
                    dataset.config.spatialCoverageProvider().then(extent => {
                        centerOnMap({
                            type: 'BBox',
                            bbox: extent as GeoJSON.BBox
                        }, {animate: true});
                    });
                }

            }
        },
        {
            id: 'settings',
            icon: <Icon type='setting'></Icon>,
            title: 'Toggle visualization settings',
            content: DatasetVizSettingsFactory.create(props.datasetViz.datasetVizType, {
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
            content: <DatasetTools dataset={props.datasetViz.dataset}/>,
            callback: () => {
                if (activeAction !== 'tools') {
                    setActiveAction('tools');
                } else {
                    setActiveAction(undefined);
                }
            }
        }
    ];

    if (props.datasetViz.dataset.config.download) {
        actions.push(        {
            id: 'download',
            icon: <Icon type='download'></Icon>,
            title: 'Download',
            callback: () => {
                setDownloadVisible(true);
            }
        });
    }


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
                <div className='viz-item-name' title={vizState.name}>{vizState.name}</div>
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
            {downloadVisible &&
                <DatasetVizDownloadModal onClose={() => setDownloadVisible(false)} datasetViz={props.datasetViz}></DatasetVizDownloadModal>
            }
        </List.Item>
    );
};
