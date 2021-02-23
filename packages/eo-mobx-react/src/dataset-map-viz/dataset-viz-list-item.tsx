import React, { useState } from 'react';

import { List, Button, Badge, Tooltip } from 'antd';
import {
    AimOutlined, SettingOutlined, BarChartOutlined,
    DownloadOutlined, EyeOutlined, EyeInvisibleOutlined, DragOutlined,
    CloseOutlined, WarningOutlined
} from '@ant-design/icons';
import { SortableHandle } from 'react-sortable-hoc';

import { useSelector, useCenterOnMapFromModule } from '@oida/ui-react-mobx';
import { DatasetViz, DatasetExplorer } from '@oida/eo-mobx';

import { DatasetVizProgressControl } from './dataset-viz-progress-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { MapLayer } from '@oida/state-mobx';
import { DatasetVizDownloadModal } from './dataset-viz-download';
import { DatasetToolsMenu } from './dataset-tools-menu';
import { LoadingState } from '@oida/core';

export type DatasetVizListItemProps = {
    datasetExplorer: DatasetExplorer;
    datasetViz: DatasetViz<MapLayer>;
    onRemove?: () => void;
};

export const DatasetVizListItem = (props: DatasetVizListItemProps) => {

    let vizState = useSelector(() => {

        let mapLayer = props.datasetViz.mapLayer;

        return {
            name: props.datasetViz.dataset.config.name,
            mapLayer: mapLayer,
            visible: mapLayer.visible.value,
            color: props.datasetViz.dataset.config.color
        };

    });

    let [activeAction, setActiveAction] = useState<string>();
    let [downloadVisible, setDownloadVisible] = useState(false);

    let centerOnMap = useCenterOnMapFromModule();

    const loadingState = useSelector(() => {
        return {
            value: props.datasetViz.mapLayer.loadingStatus.value,
            message: props.datasetViz.mapLayer.loadingStatus.message
        };
    });

    let actions: any[] = [];

    if (loadingState.value !== LoadingState.Error) {
        const spatialCoverageProvider = props.datasetViz.dataset.config.spatialCoverageProvider;
        if (spatialCoverageProvider) {
            actions.push({
                id: 'areaZoom',
                icon: <AimOutlined/>,
                title: 'Zoom to dataset area',
                callback: () => {
                    spatialCoverageProvider(props.datasetViz).then((extent) => {
                        centerOnMap({
                            type: 'BBox',
                            bbox: extent as GeoJSON.BBox
                        }, {animate: true});
                    });
                }
            });
        }

        const settingsContent = DatasetVizSettingsFactory.create(props.datasetViz.vizType, {
            datasetViz: props.datasetViz
        });

        if (settingsContent) {
            actions.push({
                id: 'settings',
                icon: <SettingOutlined/>,
                title: 'Toggle visualization settings',
                content: settingsContent,
                callback: () => {
                    if (activeAction !== 'settings') {
                        setActiveAction('settings');
                    } else {
                        setActiveAction(undefined);
                    }
                }
            });
        }

        if (props.datasetViz.dataset.config.tools?.length) {
            actions.push({
                id: 'tools',
                icon: <BarChartOutlined/>,
                title: 'Toggle dataset tools',
                menu: <DatasetToolsMenu
                    datasetViz={props.datasetViz}
                    datasetExplorer={props.datasetExplorer}
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
                        vizState.mapLayer.visible.setValue(!vizState.visible);
                    }}
                >
                    {vizState.visible ? <EyeOutlined/> : <EyeInvisibleOutlined/>}
                </Button>
                <Badge color={vizState.color}></Badge>
                <div className='viz-item-name' title={vizState.name}>{vizState.name}</div>
                {loadingState.value === LoadingState.Error &&
                    <div className='viz-item-error'>
                        <Tooltip title={loadingState.message}>
                            <Button
                                size='small'
                                type='link'
                            >
                                <WarningOutlined />
                            </Button>
                        </Tooltip>
                    </div>
                }
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
