import React, { useState } from 'react';

import { List, Button, Badge, Tooltip, message } from 'antd';
import {
    AimOutlined,
    SettingOutlined,
    BarChartOutlined,
    DownloadOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    DragOutlined,
    CloseOutlined,
    WarningOutlined
} from '@ant-design/icons';
import { SortableHandle } from 'react-sortable-hoc';

import { LoadingState } from '@oidajs/core';
import { Map, MapLayer } from '@oidajs/state-mobx';
import { DataCollectionItemActionButton } from '@oidajs/ui-react-antd';
import { useSelector, useCenterOnMapFromModule } from '@oidajs/ui-react-mobx';
import { DatasetViz, DatasetExplorer } from '@oidajs/eo-mobx';

import { ComboToolConfig } from '../hooks';
import { DatasetVizProgressControl } from './dataset-viz-progress-control';
import { DatasetVizSettingsFactory } from './dataset-viz-settings-factory';
import { DatasetVizDownloadModal, DatasetVizDownloadModalProps } from './dataset-viz-download';
import { DatasetToolsMenu } from './dataset-tools-menu';

export type DatasetVizListItemProps = {
    datasetExplorer: DatasetExplorer;
    datasetViz: DatasetViz<MapLayer>;
    analyticsTools?: ComboToolConfig[];
    mapState?: Map;
    onRemove?: () => void;
    downloadComponent?: React.ComponentType<DatasetVizDownloadModalProps>;
};

export const DatasetVizListItem = (props: DatasetVizListItemProps) => {
    const vizState = useSelector(() => {
        const mapLayer = props.datasetViz.mapLayer;

        return {
            name: props.datasetViz.dataset.config.name,
            mapLayer: mapLayer,
            visible: mapLayer.visible.value,
            color: props.datasetViz.dataset.config.color
        };
    });

    const [activeAction, setActiveAction] = useState<string>();
    const [downloadVisible, setDownloadVisible] = useState(false);

    const centerOnMap = useCenterOnMapFromModule();

    const loadingState = useSelector(() => {
        return {
            value: props.datasetViz.mapLayer.loadingStatus.value,
            message: props.datasetViz.mapLayer.loadingStatus.message
        };
    });

    const actions: any[] = [];

    if (loadingState.value !== LoadingState.Error) {
        const spatialCoverageProvider = props.datasetViz.dataset.config.spatialCoverageProvider;
        if (spatialCoverageProvider) {
            actions.push({
                id: 'areaZoom',
                icon: <AimOutlined />,
                title: 'Zoom to dataset area',
                callback: () => {
                    return spatialCoverageProvider(props.datasetViz)
                        .then((extent) => {
                            centerOnMap(
                                {
                                    type: 'BBox',
                                    bbox: extent as GeoJSON.BBox
                                },
                                { animate: true }
                            );
                        })
                        .catch((error) => {
                            message.warning(`Unable to retrieve dataset extent: ${error.message}`);
                        });
                }
            });
        }
    }

    const settingsContent = DatasetVizSettingsFactory.create(props.datasetViz.vizType, {
        datasetViz: props.datasetViz,
        mapState: props.mapState
    });

    if (settingsContent) {
        actions.push({
            id: 'settings',
            icon: <SettingOutlined />,
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

    actions.push({
        id: 'tools',
        title: 'Toggle dataset tools',
        menu: (
            <DatasetToolsMenu
                datasetViz={props.datasetViz}
                analyticsTools={props.analyticsTools || []}
                datasetExplorer={props.datasetExplorer}
                icon={<BarChartOutlined />}
                key='tools'
            />
        )
    });

    if (loadingState.value !== LoadingState.Error) {
        if (props.datasetViz.dataset.config.download) {
            actions.push({
                id: 'download',
                icon: <DownloadOutlined />,
                title: 'Download',
                callback: () => {
                    setDownloadVisible(true);
                }
            });
        }
    }

    const DragHandle = SortableHandle(() => (
        <div className='viz-drag-button'>
            <DragOutlined />
        </div>
    ));

    const onItemRemove = props.onRemove;

    const DownloadComponent = props.downloadComponent || DatasetVizDownloadModal;

    return (
        <List.Item className='viz-item'>
            <div className='viz-item-content'>
                <DragHandle />
                <Button
                    size='small'
                    type='link'
                    aria-label='toggle layer visibility'
                    onClick={() => {
                        vizState.mapLayer.visible.setValue(!vizState.visible);
                    }}
                >
                    {vizState.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </Button>
                <Badge color={vizState.color}></Badge>
                <div className='viz-item-name' title={vizState.name}>
                    {vizState.name}
                </div>
                {loadingState.value === LoadingState.Error && (
                    <div className='viz-item-error'>
                        <Tooltip title={loadingState.message}>
                            <Button size='small' type='link'>
                                <WarningOutlined />
                            </Button>
                        </Tooltip>
                    </div>
                )}
                <div className='viz-item-actions'>
                    {actions.map((action) => {
                        if (action.menu) {
                            return action.menu;
                        } else {
                            return (
                                <DataCollectionItemActionButton
                                    key={action.id}
                                    action={{
                                        title: action.title,
                                        icon: action.icon,
                                        callback: action.callback,
                                        primary: action.id === activeAction
                                    }}
                                />
                            );
                        }
                    })}
                </div>
                {onItemRemove && (
                    <Tooltip title='Remove layer'>
                        <Button className='viz-iten-remove-btn' aria-label='remove layer' size='small' onClick={() => onItemRemove()}>
                            <CloseOutlined />
                        </Button>
                    </Tooltip>
                )}
            </div>
            <DatasetVizProgressControl datasetViz={props.datasetViz} />
            {actions
                .filter((action) => action.id === activeAction)
                .map((action) => {
                    return (
                        <div key={action.id} className='viz-item-pane'>
                            {action.content}
                        </div>
                    );
                })}
            {downloadVisible && (
                <DownloadComponent
                    onClose={() => setDownloadVisible(false)}
                    datasetViz={props.datasetViz}
                    downloadOptions={props.datasetViz.dataset.config.download?.supportedOptions}
                />
            )}
        </List.Item>
    );
};
