import React, { useState, useMemo, useEffect } from 'react';
import { Tag, Button, Tooltip, Drawer, Popover, Modal } from 'antd';
import { EnvironmentOutlined, LinkOutlined, EditOutlined, ImportOutlined, CloseOutlined } from '@ant-design/icons';

import { AoiField, AoiAction, AOI_FIELD_ID, getTextColorForBackground } from '@oidajs/core';
import { AoiImportConfig, FormFieldRendererBaseProps } from '@oidajs/ui-react-core';

import { DrawLineIcon } from '../icons/draw-line';
import { DrawBboxIcon } from '../icons/draw-bbox';
import { DrawPolygonIcon } from '../icons/draw-polygon';
import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';
import { AoiImportRenderer } from './aoi-import';
import { AoiTextEditor } from './aoi-text-editor';

export type AoiFieldRendererProps = FormFieldRendererBaseProps<AoiField<AoiImportConfig, React.ComponentType>> & {
    importDrawerPlacement?: 'left' | 'right';
};

export const AoiFieldRenderer = (props: AoiFieldRendererProps) => {
    const { value, onChange, readonly, config } = props;
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
        onVisibleAction,
        onCenterAction
    } = config;

    const [editorVisible, setEditorVisible] = useState(false);
    const [mapVisible, setMapVisible] = useState(() => {
        if (
            activeAction === AoiAction.DrawPoint ||
            activeAction === AoiAction.DrawLine ||
            activeAction === AoiAction.DrawBBox ||
            activeAction === AoiAction.DrawPolygon
        ) {
            return true;
        } else {
            return false;
        }
    });

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

    const showEmbeddedMap = () => {
        setMapVisible(true);
        if (onVisibleAction) {
            onVisibleAction(true);
        }
        if (onCenterAction) {
            onCenterAction();
        }
    };

    useEffect(() => {
        if (!props.config.embeddedMapComponent) {
            if (onVisibleAction) {
                onVisibleAction(true);
            }

            return () => {
                if (onVisibleAction) {
                    onVisibleAction(false);
                }
            };
        } else {
            if (onVisibleAction) {
                onVisibleAction(mapVisible);
            }
        }
    }, [props.value?.props?.id, props.config.embeddedMapComponent]);

    useEffect(() => {
        if (
            activeAction === AoiAction.DrawPoint ||
            activeAction === AoiAction.DrawLine ||
            activeAction === AoiAction.DrawBBox ||
            activeAction === AoiAction.DrawPolygon
        ) {
            if (props.config.embeddedMapComponent) {
                showEmbeddedMap();
            }
        }
    }, [activeAction, props.config.embeddedMapComponent]);

    const EmbeddedMapComponent = props.config.embeddedMapComponent;

    const tagTextColor = color ? getTextColorForBackground(color) : undefined;
    return (
        <React.Fragment>
            {value && (
                <Tag
                    closable={!readonly}
                    color={color}
                    onMouseOver={onHoverAction ? () => onHoverAction!(true) : undefined}
                    onMouseOut={onHoverAction ? () => onHoverAction!(false) : undefined}
                    onClick={() => {
                        if (props.config.embeddedMapComponent) {
                            showEmbeddedMap();
                        } else {
                            if (onSelectAction) {
                                onSelectAction(true);
                            }
                        }
                    }}
                    onClose={(evt) => {
                        evt.stopPropagation();
                        props.onChange(undefined);
                    }}
                    style={{
                        color: tagTextColor
                    }}
                    closeIcon={<CloseOutlined style={{ color: tagTextColor }} />}
                >
                    {name}
                </Tag>
            )}
            {!value && (
                <Tag color='#dddddd' style={{ color: 'black' }}>
                    No area specified
                </Tag>
            )}
            {!readonly && (
                <Button.Group size='small' className='aoi-draw-actions'>
                    {aoiControls.point && (
                        <Tooltip title='Select coordinate'>
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
                                <EnvironmentOutlined />
                            </Button>
                        </Tooltip>
                    )}
                    {aoiControls.line && (
                        <Tooltip title='Draw line'>
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
                                <DrawLineIcon />
                            </Button>
                        </Tooltip>
                    )}
                    {aoiControls.bbox && (
                        <Tooltip title='Draw bbox'>
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
                                <DrawBboxIcon />
                            </Button>
                        </Tooltip>
                    )}
                    {aoiControls.polygon && (
                        <Tooltip title='Draw polygon'>
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
                                <DrawPolygonIcon />
                            </Button>
                        </Tooltip>
                    )}
                    {aoiControls.linkToViewport && (
                        <Tooltip title='Link to map viewport'>
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
                                <LinkOutlined />
                            </Button>
                        </Tooltip>
                    )}
                </Button.Group>
            )}
            <Button.Group className='aoi-edit-actions' size='small'>
                {(value || !readonly) && (
                    <Tooltip title={readonly ? 'View aoi' : 'Edit aoi'}>
                        <Popover
                            className='aoi-editor-popover'
                            content={
                                <AoiTextEditor
                                    value={value}
                                    onChange={onChange}
                                    supportedGeometries={supportedGeometries}
                                    readonly={readonly}
                                />
                            }
                            destroyTooltipOnHide={true}
                            title={readonly ? 'Area' : 'Edit area'}
                            visible={editorVisible}
                            onVisibleChange={(visible) => setEditorVisible(visible)}
                            trigger='click'
                            zIndex={1050}
                        >
                            <Button type={editorVisible ? 'primary' : 'default'}>
                                <EditOutlined />
                            </Button>
                        </Popover>
                    </Tooltip>
                )}
                {!readonly && aoiControls.import && (
                    <Tooltip title='Import area'>
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
                            <ImportOutlined />
                        </Button>
                    </Tooltip>
                )}
            </Button.Group>
            {aoiControls.import && importConfig && !readonly && (
                <Drawer
                    push={false}
                    className='aoi-import-drawer'
                    visible={activeAction === AoiAction.Import}
                    width={370}
                    placement={props.importDrawerPlacement || 'left'}
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
                    maskStyle={{ display: 'none' }} // to prevent a bug in ant when mask is set to false
                >
                    <AoiImportRenderer {...importConfig} />
                </Drawer>
            )}
            {EmbeddedMapComponent && (
                <Modal
                    className='aoi-embedded-map-dialog'
                    visible={mapVisible}
                    footer={null}
                    centered={true}
                    destroyOnClose={true}
                    onCancel={() => {
                        onActiveActionChange(AoiAction.None);
                        if (onVisibleAction) {
                            onVisibleAction(false);
                        }
                        if (onSelectAction) {
                            onSelectAction(false);
                        }
                        setMapVisible(false);
                    }}
                >
                    <EmbeddedMapComponent />
                </Modal>
            )}
        </React.Fragment>
    );
};

antdFormFieldRendererFactory.register<AoiField>(AOI_FIELD_ID, 'aoi', AoiFieldRenderer);
