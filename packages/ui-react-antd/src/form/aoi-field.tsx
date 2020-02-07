import React, { useState, useMemo } from 'react';

import { Tag, Button, Tooltip, Icon, Drawer, Popover } from 'antd';

import { AoiField, AoiAction, AOI_FIELD_ID } from '@oida/ui-react-core';

import { antdFormFieldRendererFactory } from './antd-form-field-renderer-factory';

import { DrawBboxIcon } from '../icons/draw-bbox';
import { DrawPolygonIcon } from '../icons/draw-polygon';

import { AoiImportRenderer } from './aoi-import';
import { AoiEditor } from './aoi-editor';

export const AoiFieldRenderer = (props:  Omit<AoiField, 'name' | 'type'>) => {

    const [importVisible, setImportVisible] = useState(false);
    const [editorVisible, setEditorVisible] = useState(false);

    const { value, onChange, config, ...renderProps } = props;
    const { supportedGeometries, onDrawPointAction, onDrawBBoxAction, onDrawPolygonAction, onLinkToViewportAction,
         aoiImport, onHoverAction, onSelectAction, activeAction, color, name } = config;

    const aoiControls = useMemo(() => {
        const point = onDrawPointAction && supportedGeometries.some(geometryType => {
            return geometryType === 'Point' || geometryType === 'MultiPoint';
        });

        const bbox = onDrawBBoxAction && supportedGeometries.some(geometryType => {
            return geometryType === 'BBox';
        });

        const polygon = onDrawPolygonAction && supportedGeometries.some(geometryType => {
            return geometryType === 'Polygon' || geometryType === 'MultiPolygon';
        });

        return {
            point,
            bbox,
            polygon
        };

    }, [supportedGeometries, onDrawPointAction, onDrawBBoxAction, onDrawPolygonAction]);

    if (aoiImport) {
        let importAction = aoiImport.onAoiImportAction;
        aoiImport.onAoiImportAction = (aoi) => {
            importAction(aoi);
            setImportVisible(false);
        };
    }

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
                    if (activeAction === AoiAction.LinkToViewport) {
                        if (onLinkToViewportAction) {
                            onLinkToViewportAction();
                        }
                    } else {
                        props.onChange(undefined);
                    }
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
                            size='small'
                            onClick={() => onDrawPointAction!()}
                        >
                            <Icon type='environment'/>
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
                            size='small'
                            onClick={() => onDrawBBoxAction!()}
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
                            size='small'
                            onClick={() => onDrawPolygonAction!()}
                        >
                            <DrawPolygonIcon/>
                        </Button>
                    </Tooltip>
                }
                {
                    aoiControls.bbox && onLinkToViewportAction &&
                    <Tooltip
                        title='Link to viewport'
                    >
                        <Button
                            type={activeAction === AoiAction.LinkToViewport ? 'primary' : 'default'}
                            size='small'
                            onClick={() => onLinkToViewportAction!()}
                        >
                            <Icon type='link'/>
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
                                supportedGeometries={supportedGeometries}
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
                            size='small'
                        >
                            <Icon type='edit'/>
                        </Button>
                    </Popover>
                    </Tooltip>
                }
                {
                    aoiImport &&
                    <Tooltip
                        title='Import area'
                    >
                        <Button
                            type={importVisible ? 'primary' : 'default'}
                            size='small'
                            onClick={() => setImportVisible(!importVisible)}
                        >
                            <Icon type='import'/>
                        </Button>
                    </Tooltip>
                }
            </Button.Group>
            {aoiImport &&
                <Drawer
                    className='aoi-import-drawer'
                    visible={importVisible}
                    width={370}
                    placement='left'
                    onClose={() => {
                        setImportVisible(false);
                        if (aoiImport.onImportCancel) {
                            aoiImport.onImportCancel();
                        }
                    }}
                    afterVisibleChange={(visible) => {
                        if (!visible) {
                            if (aoiImport.onImportCancel) {
                                aoiImport.onImportCancel();
                            }
                        }
                    }}
                    destroyOnClose={true}
                    title='Import area of interest'
                    mask={false}
                >
                    <AoiImportRenderer
                        {...aoiImport}
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
