import React, { useState, useMemo } from 'react';
import { Tag, Button, Tooltip, Drawer, Dropdown, Divider, Popover, Modal, MenuProps } from 'antd';
import {
    EnvironmentOutlined,
    LinkOutlined,
    ImportOutlined,
    AimOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CloseOutlined,
    CaretDownOutlined,
    EditOutlined
} from '@ant-design/icons';

import { AoiField, AoiAction, AOI_FIELD_ID } from '@oidajs/core';
import { AoiImportConfig, FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { DrawLineIcon, DrawBboxIcon, DrawPolygonIcon } from '../icons';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';
import { AoiImportRenderer } from './aoi-import';
import { AoiTextEditor } from './aoi-text-editor';

export type AoiDrawToolProps = FormFieldRendererBaseProps<AoiField<AoiImportConfig>> & {
    importDrawerPlacement?: 'left' | 'right';
    size?: 'small' | 'middle' | 'large';
};

export const AoiDrawTool = (props: AoiDrawToolProps) => {
    const { value, onChange, config } = props;
    const {
        supportedActions,
        supportedGeometries,
        activeAction,
        color,
        name,
        importConfig,
        onActiveActionChange,
        onHoverAction,
        onSelectAction,
        onCenterAction,
        onVisibleAction,
        state
    } = config;

    const aoiControls = useMemo(() => {
        const point =
            supportedActions.indexOf(AoiAction.DrawPoint) !== -1 &&
            supportedGeometries.some((geometry) => {
                return geometry.type === 'Point' || geometry.type === 'MultiPoint';
            });

        const line =
            supportedActions.indexOf(AoiAction.DrawLine) !== -1 &&
            supportedGeometries.some((geometry) => {
                return geometry.type === 'LineString' || geometry.type === 'MultiLineString';
            });

        const bbox =
            supportedActions.indexOf(AoiAction.DrawBBox) !== -1 &&
            supportedGeometries.some((geometry) => {
                return geometry.type === 'BBox' || geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';
            });

        const polygon =
            supportedActions.indexOf(AoiAction.DrawPolygon) !== -1 &&
            supportedGeometries.some((geometry) => {
                return geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';
            });

        const linkToViewport =
            supportedActions.indexOf(AoiAction.LinkToMapViewport) !== -1 &&
            supportedGeometries.some((geometry) => {
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

    const [lastUsedTool, setLastUsedTool] = useState(AoiAction.DrawBBox);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const drawingTools = {
        [AoiAction.DrawPoint]: (
            <Tooltip title='Select a coordinate' key='point'>
                <Button
                    key='point'
                    icon={<EnvironmentOutlined />}
                    type={activeAction === AoiAction.DrawPoint ? 'primary' : 'default'}
                    size={props.size}
                    aria-label='Select a coordinate'
                    onClick={() => {
                        if (activeAction !== AoiAction.DrawPoint) {
                            setLastUsedTool(AoiAction.DrawPoint);
                            onActiveActionChange(AoiAction.DrawPoint);
                        } else {
                            onActiveActionChange(AoiAction.None);
                        }
                    }}
                ></Button>
            </Tooltip>
        ),
        [AoiAction.DrawLine]: (
            <Tooltip title='Draw a line string' key='line'>
                <Button
                    key='line'
                    icon={<DrawLineIcon />}
                    aria-label='Line string'
                    type={activeAction === AoiAction.DrawLine ? 'primary' : 'default'}
                    size={props.size}
                    onClick={() => {
                        if (activeAction !== AoiAction.DrawLine) {
                            setLastUsedTool(AoiAction.DrawLine);
                            onActiveActionChange(AoiAction.DrawLine);
                        } else {
                            onActiveActionChange(AoiAction.None);
                        }
                    }}
                ></Button>
            </Tooltip>
        ),
        [AoiAction.DrawBBox]: (
            <Tooltip title='Draw a bounding box' key='bbox'>
                <Button
                    key='bbox'
                    icon={<DrawBboxIcon />}
                    aria-label='Bounding box'
                    type={activeAction === AoiAction.DrawBBox ? 'primary' : 'default'}
                    size={props.size}
                    onClick={() => {
                        if (activeAction !== AoiAction.DrawBBox) {
                            setLastUsedTool(AoiAction.DrawBBox);
                            onActiveActionChange(AoiAction.DrawBBox);
                        } else {
                            onActiveActionChange(AoiAction.None);
                        }
                    }}
                ></Button>
            </Tooltip>
        ),
        [AoiAction.DrawPolygon]: (
            <Tooltip title='Draw a polygonal area' key='polygon'>
                <Button
                    key='polygon'
                    icon={<DrawPolygonIcon />}
                    aria-label='Polygonal area'
                    type={activeAction === AoiAction.DrawPolygon ? 'primary' : 'default'}
                    size={props.size}
                    onClick={() => {
                        if (activeAction !== AoiAction.DrawPolygon) {
                            setLastUsedTool(AoiAction.DrawPolygon);
                            onActiveActionChange(AoiAction.DrawPolygon);
                        } else {
                            onActiveActionChange(AoiAction.None);
                        }
                    }}
                ></Button>
            </Tooltip>
        ),
        ['AoiTextEdit']: (
            <Tooltip title='Manually enter an AOI string' key='textEdit'>
                <Button
                    key='polygon'
                    icon={<EditOutlined />}
                    aria-label='Area edit'
                    type={'default'}
                    size={props.size}
                    onClick={() => {
                        onActiveActionChange(AoiAction.None);
                        setEditModalVisible(true);
                    }}
                ></Button>
            </Tooltip>
        ),
        [AoiAction.LinkToMapViewport]: (
            <Tooltip title='Link to map viewport' key='viewport'>
                <Button
                    key='viewport'
                    icon={<LinkOutlined />}
                    aria-label='Link area to viewport'
                    type={activeAction === AoiAction.LinkToMapViewport ? 'primary' : 'default'}
                    size={props.size}
                    onClick={() => {
                        if (activeAction !== AoiAction.LinkToMapViewport) {
                            setLastUsedTool(AoiAction.LinkToMapViewport);
                            onActiveActionChange(AoiAction.LinkToMapViewport);
                        } else {
                            onActiveActionChange(AoiAction.None);
                        }
                    }}
                ></Button>
            </Tooltip>
        ),
        [AoiAction.Import]: (
            <Tooltip title='Import area' key='import'>
                <Button
                    key='import'
                    icon={<ImportOutlined />}
                    aria-label='Import area'
                    type={activeAction === AoiAction.Import ? 'primary' : 'default'}
                    size={props.size}
                    onClick={() => {
                        if (activeAction !== AoiAction.Import) {
                            onActiveActionChange(AoiAction.Import);
                        } else {
                            onActiveActionChange(AoiAction.None);
                        }
                    }}
                ></Button>
            </Tooltip>
        )
    };

    const menuItems = useMemo(() => {
        const items: MenuProps['items'] = [];
        if (aoiControls.point) {
            items.push({
                key: 'point',
                label: drawingTools[AoiAction.DrawPoint]
            });
        }
        if (aoiControls.line) {
            items.push({
                key: 'line',
                label: drawingTools[AoiAction.DrawLine]
            });
        }
        if (aoiControls.bbox) {
            items.push({
                key: 'bbox',
                label: drawingTools[AoiAction.DrawBBox]
            });
        }
        if (aoiControls.polygon) {
            items.push({
                key: 'polygon',
                label: drawingTools[AoiAction.DrawPolygon]
            });
        }
        items.push({
            key: 'edit',
            label: drawingTools['AoiTextEdit']
        });
        if (aoiControls.import) {
            items.push({
                key: 'import',
                label: drawingTools[AoiAction.Import]
            });
        }
        return items;
    }, [aoiControls]);

    return (
        <div className='aoi-draw-tool'>
            <div className='aoi-tool-selector'>
                {activeAction !== AoiAction.None ? drawingTools[activeAction] : drawingTools[lastUsedTool]}
                <Dropdown
                    menu={{ items: menuItems }}
                    trigger={['hover']}
                    placement='bottomRight'
                    mouseEnterDelay={0}
                    className='aoi-tool-selector-more'
                    overlayClassName='aoi-tool-selector-menu'
                >
                    <CaretDownOutlined />
                </Dropdown>
            </div>
            {value && (
                <React.Fragment>
                    <div className='aoi-draw-tool-current'>
                        <Tag
                            color={color}
                            onMouseOver={onHoverAction ? () => onHoverAction!(true) : undefined}
                            onMouseOut={onHoverAction ? () => onHoverAction!(false) : undefined}
                            onClick={onSelectAction ? () => onSelectAction!(true) : undefined}
                        >
                            {name}
                        </Tag>
                        {onCenterAction && <Button size={'small'} type='link' icon={<AimOutlined />} onClick={() => onCenterAction()} />}
                        {onVisibleAction && (
                            <Button
                                size={'small'}
                                type='link'
                                icon={state.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                onClick={() => onVisibleAction(!state.visible)}
                            />
                        )}
                        <Divider type='vertical' />
                        <Popover
                            content={
                                <AoiTextEditor
                                    value={value}
                                    supportedGeometries={props.config.supportedGeometries}
                                    onChange={(value) => props.onChange(value)}
                                />
                            }
                            title='Edit area'
                            trigger='click'
                            destroyTooltipOnHide={false}
                        >
                            <Tooltip title='Edit area'>
                                <Button type='text' size={'middle'} icon={<EditOutlined />} />
                            </Tooltip>
                        </Popover>
                        <Tooltip title='Clear area'>
                            <Button type='text' size={'middle'} icon={<CloseOutlined />} onClick={() => onChange(undefined)} />
                        </Tooltip>
                    </div>
                </React.Fragment>
            )}
            {aoiControls.import && importConfig && (
                <Drawer
                    push={false}
                    className='aoi-import-drawer'
                    open={activeAction === AoiAction.Import}
                    width={370}
                    placement={props.importDrawerPlacement || 'left'}
                    onClose={() => {
                        onActiveActionChange(AoiAction.None);
                    }}
                    afterOpenChange={(visible) => {
                        if (!visible) {
                            if (importConfig.onImportCancel) {
                                importConfig.onImportCancel();
                            }
                        }
                    }}
                    destroyOnClose={true}
                    title='Import area of interest'
                    mask={true}
                    maskStyle={{ display: 'none' }} // to prevent a bug in ant when mask is set to false
                >
                    <AoiImportRenderer {...importConfig} />
                </Drawer>
            )}
            <Modal
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
                width={600}
                destroyOnClose={true}
                className='aoi-draw-tool-text-modal'
            >
                <AoiTextEditor
                    value={undefined}
                    supportedGeometries={props.config.supportedGeometries}
                    onChange={(value) => {
                        props.onChange(value);
                        setEditModalVisible(false);
                    }}
                />
            </Modal>
        </div>
    );
};

antdFormFieldRendererFactory.register<AoiField>(AOI_FIELD_ID, 'tool', AoiDrawTool);
