import React from 'react';

import { useDrag, useDrop } from 'react-dnd';
import classnames from 'classnames';

import { Tooltip } from 'antd';
import { LinkOutlined, DragOutlined } from '@ant-design/icons';

import { AoiSupportedGeometry, AoiAction, AoiValue } from '@oidajs/core';
import { DatasetProcessing, SharedAoi } from '@oidajs/eo-mobx';
import { AoiFieldRenderer } from '@oidajs/ui-react-antd';
import { useMapAoiDrawerFromModule, useAoiAction, useSelector, useMapAoiImporter } from '@oidajs/ui-react-mobx';

import { useAnalysisGeometryFromModule } from './use-analysis-geometry';

export type AnalysisAoiFilterProps = {
    analysis: DatasetProcessing<any>;
    supportedGeometries: AoiSupportedGeometry[];
};

type AoiItemType = {
    aoi?: SharedAoi;
    type: string;
};

export const AnalysisAoiFilter = (props: AnalysisAoiFilterProps) => {
    const geometryValue = useSelector(() => props.analysis.aoi?.geometry.value, [props.analysis]);
    const aoi = useSelector(() => props.analysis.aoi, [props.analysis]);

    const { activeAction, onActiveActionChange } = useAoiAction();

    const [{ isDragging }, drag, preview] = useDrag({
        item: { type: 'ANALYSIS_AOI', aoi: aoi },
        canDrag: (item) => {
            return !!aoi;
        },
        collect: (monitor) => {
            return {
                isDragging: monitor.isDragging()
            };
        }
    });

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ['ANALYSIS_AOI'],
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        }),
        canDrop: (item) => {
            return !!item.aoi && item.aoi !== aoi;
        },
        drop: (item: AoiItemType) => {
            if (item.aoi) {
                props.analysis.setAoi(item.aoi);
            }
        }
    });

    const isLinked = useSelector(() => props.analysis.aoi?.shared || false, [props.analysis]);

    const value = geometryValue
        ? {
              geometry: geometryValue,
              name: aoi?.name
          }
        : undefined;

    const onChange = (value: AoiValue | undefined) => {
        if (value) {
            if (props.analysis.aoi) {
                props.analysis.aoi.geometry.setValue(value.geometry);
                props.analysis.aoi.setName(value.props?.name);
            } else {
                props.analysis.setAoi({
                    geometry: value.geometry,
                    name: value.props?.name
                });
            }
        } else {
            props.analysis.setAoi(undefined);
        }
    };

    const supportedActions = [AoiAction.DrawPoint, AoiAction.DrawLine, AoiAction.DrawBBox, AoiAction.DrawPolygon, AoiAction.Import];

    useMapAoiDrawerFromModule({
        value: value,
        onChange: onChange,
        supportedGeometries: props.supportedGeometries,
        activeAction,
        onActiveActionChange
    });

    const importerProps = useMapAoiImporter({
        value,
        onChange,
        activeAction,
        onActiveActionChange
    });

    const analysisGeometryState = useAnalysisGeometryFromModule(props.analysis);

    const aoiFilterConfig = {
        ...analysisGeometryState,
        importConfig: importerProps,
        activeAction,
        onActiveActionChange,
        supportedGeometries: props.supportedGeometries,
        supportedActions
    };

    return (
        <div
            ref={preview}
            className={classnames('analysis-aoi-filter', {
                'is-linked': isLinked,
                'is-dragging': isDragging,
                'is-dropping': isOver,
                'can-drop': canDrop,
                'can-drag': !!aoi
            })}
        >
            {aoi && (
                <Tooltip title='Drag to link to another analysis area'>
                    <DragOutlined className='drag-handle' ref={drag} />
                </Tooltip>
            )}
            <div className='aoi-field-container' ref={drop}>
                <AoiFieldRenderer
                    config={aoiFilterConfig}
                    value={
                        geometryValue
                            ? {
                                  geometry: geometryValue,
                                  props: {
                                      name: aoi?.name
                                  }
                              }
                            : undefined
                    }
                    onChange={onChange}
                />
            </div>
            {isLinked && (
                <Tooltip title='Unlink'>
                    <LinkOutlined
                        className='unlink-button'
                        onClick={() =>
                            props.analysis.setAoi(
                                props.analysis.aoi
                                    ? {
                                          geometry: props.analysis.aoi.geometry.value
                                      }
                                    : undefined
                            )
                        }
                    />
                </Tooltip>
            )}
        </div>
    );
};
