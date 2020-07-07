import React from 'react';
import { useObserver } from 'mobx-react';
import { useDrag, useDrop } from 'react-dnd';
import classnames from 'classnames';

import { Tooltip } from 'antd';
import { LinkOutlined, DragOutlined } from '@ant-design/icons';

import { AoiSupportedGeometry, AoiAction } from '@oida/core';
import { IDatasetAnalysis } from '@oida/eo';
import { AoiFieldRenderer } from '@oida/ui-react-antd';
import { useMapAoiDrawerFromModule, useAoiAction } from '@oida/ui-react-mst';

import { useAnalysisGeometryFromModule } from './use-analysis-geometry';

export type AnalysisAoiFilterProps = {
    analysis: IDatasetAnalysis
    supportedGeometries: AoiSupportedGeometry[];
    linkedAois?: Set<string>
};

type AoiItemType = {
    id?: string,
    type: string
};

export const AnalysisAoiFilter = (props: AnalysisAoiFilterProps) => {
    let geometryValue = useObserver(() => props.analysis.geometry);

    let { activeAction, onActiveActionChange } = useAoiAction();

    const aoi = useObserver(() => props.analysis.datasetViz.aoi);

    const [{isDragging}, drag, preview] = useDrag({
        item: {type: 'ANALYSIS_AOI', id: aoi ? aoi.id : undefined},
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
          canDrop: monitor.canDrop(),
        }),
        canDrop: (item) => {
            return !!item.id && item.id !== aoi?.id;
        },
        drop: (item: AoiItemType) => {
            if (item.id) {
                props.analysis.datasetViz.linkAoi(item.id);
            }
        }
    });

    const isLinked = props.linkedAois && aoi && props.linkedAois.has(aoi.id);

    let value =  geometryValue ? {
        geometry: geometryValue
    } : undefined;

    const onChange = (value) => {
        props.analysis.datasetViz.setAoi(value ? {
            geometry: value.geometry
         } : undefined);
    };

    const supportedActions = [
        AoiAction.DrawPoint,
        AoiAction.DrawLine,
        AoiAction.DrawBBox,
        AoiAction.Import
    ];

    useMapAoiDrawerFromModule({
        value: value,
        onChange: onChange,
        supportedGeometries: props.supportedGeometries,
        activeAction,
        onActiveActionChange
    });

    let analysisGeometryState = useAnalysisGeometryFromModule(props.analysis);

    let aoiFilterConfig = {
        ...analysisGeometryState,
        activeAction,
        onActiveActionChange,
        supportedGeometries: props.supportedGeometries,
        supportedActions
    };

    return (
        <div ref={preview} className={classnames('analysis-aoi-filter', {
            'is-linked': isLinked,
            'is-dragging': isDragging,
            'is-dropping': isOver,
            'can-drop': canDrop,
            'can-drag': !!aoi
        })}>
            {aoi &&
                <Tooltip
                    title='Drag to link to another analysis area'
                >
                    <DragOutlined className='drag-handle' ref={drag}/>
                </Tooltip>
            }
            <div className='aoi-field-container' ref={drop}>
                <AoiFieldRenderer
                    config={aoiFilterConfig}
                    value={geometryValue ? {
                        geometry: geometryValue
                    } : undefined}
                    onChange={onChange}
                />
            </div>
            {isLinked &&
                <Tooltip
                    title='Unlink'
                >
                    <LinkOutlined
                        className='unlink-button'
                        onClick={() => props.analysis.datasetViz.unlinkAoi()}
                    />
                </Tooltip>
            }
        </div>
    );
};
