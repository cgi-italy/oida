import React from 'react';
import { useObserver } from 'mobx-react';

import { AoiSupportedGeometry, AoiAction } from '@oida/core';
import { IDatasetAnalysis } from '@oida/eo';
import { AoiFieldRenderer } from '@oida/ui-react-antd';
import { useMapAoiDrawerFromModule, useAoiAction } from '@oida/ui-react-mst';

import { useAnalysisGeometryFromModule } from './use-analysis-geometry';

export type AnalysisAoiFilterProps = {
    analysis: IDatasetAnalysis
    supportedGeometries: AoiSupportedGeometry[];
};

export const AnalysisAoiFilter = (props: AnalysisAoiFilterProps) => {
    let geometryValue = useObserver(() => props.analysis.geometry);

    let { activeAction, onActiveActionChange } = useAoiAction();

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
        <AoiFieldRenderer
            config={aoiFilterConfig}
            value={geometryValue ? {
                geometry: geometryValue
            } : undefined}
            onChange={onChange}
        />
    );
};
