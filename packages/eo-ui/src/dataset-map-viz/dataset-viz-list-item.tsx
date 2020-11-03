import React, { useState } from 'react';

import { isAlive } from 'mobx-state-tree';
import { useObserver } from 'mobx-react';

import { List, Button, Badge, Tooltip } from 'antd';
import {
    FullscreenExitOutlined, SettingOutlined, BarChartOutlined,
    DownloadOutlined, EyeOutlined, EyeInvisibleOutlined, DragOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { SortableHandle } from 'react-sortable-hoc';

import { useCenterOnMapFromModule } from '@oida/ui-react-mst';
import { IDatasetViz } from '@oida/eo';

import { DatasetVizProgressControl } from './dataset-viz-progress-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetToolsMenu } from './dataset-tools-menu';
import { DatasetVizDownloadModal } from './dataset-viz-download';

export type DatasetVizListItemProps = {
    datasetViz: IDatasetViz;
    onRemove?: () => void;
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

    let actions: any[] = [
        {
            id: 'areaZoom',
            icon: <FullscreenExitOutlined/>,
            title: 'Zoom to dataset area',
            callback: () => {
                let dataset = props.datasetViz.dataset;
                if (dataset.config.spatialCoverageProvider) {
                    dataset.config.spatialCoverageProvider(props.datasetViz).then(extent => {
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
            icon: <SettingOutlined/>,
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
        }
    ];

    if (props.datasetViz.dataset.config.tools?.length) {
        actions.push({
            id: 'tools',
            icon: <BarChartOutlined/>,
            title: 'Toggle dataset tools',
            menu: <DatasetToolsMenu
                datasetViz={props.datasetViz}
                icon={<BarChartOutlined/>}
                key='tools'
            />
        });
    }

    if (props.datasetViz.dataset.config.download) {
        actions.push(        {
            id: 'download',
            icon: <DownloadOutlined/>,
            title: 'Download',
            callback: () => {
                setDownloadVisible(true);
            }
        });
    }


    let DragHandle = SortableHandle(() => <div className='viz-drag-button'><DragOutlined/></div>);

    const onItemRemove = props.onRemove;

    return (
        <List.Item
            className='viz-item'
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
                    {vizState.visible ? <EyeOutlined/> : <EyeInvisibleOutlined/>}
                </Button>
                <Badge color={vizState.color}></Badge>
                <div className='viz-item-name' title={vizState.name}>{vizState.name}</div>
                <div className='viz-item-actions'>
                {
                    actions.map((action) => {
                        if (action.menu) {
                            return action.menu;
                        } else {
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
                        }
                    })
                }
                </div>
                {onItemRemove && <Tooltip title='Remove layer'>
                    <Button
                        className='viz-iten-remove-btn'
                        size='small'
                        onClick={() => onItemRemove()}
                    >
                        <CloseOutlined/>
                    </Button>
                </Tooltip>
                }
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
