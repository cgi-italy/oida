import React, { useState, useMemo } from 'react';

import { Tag, Button, Tooltip, Drawer, Popover } from 'antd';

import { EnvironmentOutlined, LinkOutlined, EditOutlined, ImportOutlined } from '@ant-design/icons';
import { AoiField, AoiAction, AOI_FIELD_ID } from '@oida/core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

import { DrawLineIcon } from '../icons/draw-line';
import { DrawBboxIcon } from '../icons/draw-bbox';
import { DrawPolygonIcon } from '../icons/draw-polygon';

import { AoiImportRenderer } from './aoi-import';
import { AoiEditor } from './aoi-editor';
import { AoiImportConfig } from '@oida/ui-react-core';

export type AoiFieldRendererProps = Omit<AoiField<AoiImportConfig>, 'name' | 'type'>;

export const AoiFieldRenderer = (props:  AoiFieldRendererProps) => {

    const [editorVisible, setEditorVisible] = useState(false);

    const { value, onChange, config, ...renderProps } = props;
    const {
        supportedActions, supportedGeometries,
        activeAction, color, name, importConfig,
        onActiveActionChange, onHoverAction, onSelectAction
    } = config;

    const aoiControls = useMemo(() => {
        const point = supportedActions.indexOf(AoiAction.DrawPoint) !== -1 && supportedGeometries.some(geometry => {
            return geometry.type === 'Point' || geometry.type === 'MultiPoint';
        });

        const line = supportedActions.indexOf(AoiAction.DrawLine) !== -1 && supportedGeometries.some(geometry => {
            return geometry.type === 'LineString' || geometry.type === 'MultiLineString';
        });

        const bbox = supportedActions.indexOf(AoiAction.DrawBBox) !== -1 && supportedGeometries.some(geometry => {
            return geometry.type === 'BBox' || geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';
        });

        const polygon = supportedActions.indexOf(AoiAction.DrawPolygon) !== -1 && supportedGeometries.some(geometry => {
            return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';
        });

        const linkToViewport = supportedActions.indexOf(AoiAction.LinkToMapViewport) !== -1 && supportedGeometries.some(geometry => {
            return geometry.type === 'BBox' || geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';
        });

        const importAction = importConfig && supportedActions.indexOf(AoiAction.Import) !== -1;

        return {
            point,
            line,
            bbox,
            polygon,
            linkToViewport,
            import: importAction
        };

    }, [supportedGeometries, supportedActions]);

    return (
        <React.Fragment>
            {value &&
            <Tag
                closable
                color={color}
                onMouseOver={onHoverAction ? () => onHoverAction!(true) : undefined}
                onMouseOut={onHoverAction ? () => onHoverAction!(false) : undefined}
                onClick={onSelectAction ? () => onSelectAction!(true) : undefined}
                onClose={(evt) => {
                    evt.stopPropagation();
                    props.onChange(undefined);
                }}
            >
                {name}
            </Tag>
            }
            {!value &&
            <Tag
                color='#dddddd'
            >No area specified</Tag>
            }
            <Button.Group
                className='aoi-draw-actions'
            >
                {
                    aoiControls.point &&
                    <Tooltip
                        title='Select coordinate'
                    >
                        <Button
                            type={activeAction === AoiAction.DrawPoint ? 'primary' : 'default'}
                            onClick={() => {
                                if (activeAction === AoiAction.DrawPoint) {
                                    onActiveActionChange(AoiAction.None);
                                } else {
                                    onActiveActionChange(AoiAction.DrawPoint);
                                }
                            }}
                        >
                            <EnvironmentOutlined/>
                        </Button>
                    </Tooltip>
                }
                {
                    aoiControls.line &&
                    <Tooltip
                        title='Draw line'
                    >
                        <Button
                            type={activeAction === AoiAction.DrawLine ? 'primary' : 'default'}
                            onClick={() => {
                                if (activeAction === AoiAction.DrawLine) {
                                    onActiveActionChange(AoiAction.None);
                                } else {
                                    onActiveActionChange(AoiAction.DrawLine);
                                }
                            }}
                        >
                            <DrawLineIcon/>
                        </Button>
                    </Tooltip>
                }
                {
                    aoiControls.bbox &&
                    <Tooltip
                        title='Draw bbox'
                    >
                        <Button
                            type={activeAction === AoiAction.DrawBBox ? 'primary' : 'default'}

                            onClick={() => {
                                if (activeAction === AoiAction.DrawBBox) {
                                    onActiveActionChange(AoiAction.None);
                                } else {
                                    onActiveActionChange(AoiAction.DrawBBox);
                                }
                            }}
                        >
                            <DrawBboxIcon/>
                        </Button>
                    </Tooltip>
                }
                {
                    aoiControls.polygon &&
                    <Tooltip
                        title='Draw polygon'
                    >
                        <Button
                            type={activeAction === AoiAction.DrawPolygon ? 'primary' : 'default'}
                            onClick={() => {
                                if (activeAction === AoiAction.DrawPolygon) {
                                    onActiveActionChange(AoiAction.None);
                                } else {
                                    onActiveActionChange(AoiAction.DrawPolygon);
                                }
                            }}
                        >
                            <DrawPolygonIcon/>
                        </Button>
                    </Tooltip>
                }
                {
                    aoiControls.linkToViewport &&
                    <Tooltip
                        title='Link to map viewport'
                    >
                        <Button
                            type={activeAction === AoiAction.LinkToMapViewport ? 'primary' : 'default'}
                            onClick={() => {
                                if (activeAction === AoiAction.LinkToMapViewport) {
                                    onChange(undefined);
                                } else {
                                    onActiveActionChange(AoiAction.LinkToMapViewport);
                                }
                            }}
                        >
                            <LinkOutlined/>
                        </Button>
                    </Tooltip>
                }
                </Button.Group>
                <Button.Group
                    className='aoi-edit-actions'
                >
                {
                    <Tooltip
                        title='Edit aoi'
                    >
                    <Popover
                        className='aoi-editor-popover'
                        content={
                            <AoiEditor
                                value={value}
                                onChange={onChange}
                                supportedGeometries={supportedGeometries.map(geometry => geometry.type)}
                                onDone={() => setEditorVisible(false)}
                            />
                        }
                        destroyTooltipOnHide={true}
                        title='Edit area'
                        visible={editorVisible}
                        onVisibleChange={(visible) => setEditorVisible(visible)}
                        trigger='click'
                    >
                        <Button
                            type={editorVisible ? 'primary' : 'default'}
                        >
                            <EditOutlined/>
                        </Button>
                    </Popover>
                    </Tooltip>
                }
                {
                    aoiControls.import &&
                    <Tooltip
                        title='Import area'
                    >
                        <Button
                            type={activeAction === AoiAction.Import ? 'primary' : 'default'}
                            onClick={() => {
                                if (activeAction === AoiAction.Import) {
                                    onActiveActionChange(AoiAction.None);
                                } else {
                                    onActiveActionChange(AoiAction.Import);
                                }
                            }}
                        >
                            <ImportOutlined/>
                        </Button>
                    </Tooltip>
                }
            </Button.Group>
            {
                aoiControls.import && importConfig &&
                <Drawer
                    className='aoi-import-drawer'
                    visible={activeAction === AoiAction.Import}
                    width={370}
                    placement='left'
                    onClose={() => {
                        onActiveActionChange(AoiAction.None);
                    }}
                    afterVisibleChange={(visible) => {
                        if (!visible) {
                            if (importConfig.onImportCancel) {
                                importConfig.onImportCancel();
                            }
                        }
                    }}
                    destroyOnClose={true}
                    title='Import area of interest'
                    mask={true}
                    maskStyle={{display: 'none'}} // to prevent a bug in ant when mask is set to false
                >
                    <AoiImportRenderer
                        {...importConfig}
                    />
                </Drawer>
            }
        </React.Fragment>
    );
};

antdFormFieldRendererFactory.register<AoiField>(
    AOI_FIELD_ID, 'aoi',
    AoiFieldRenderer
);
