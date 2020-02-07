import React from 'react';
import { useObserver } from 'mobx-react';


import { GeometryTypes } from '@oida/core';
import { IDatasetAnalysis } from '@oida/eo';
import { AoiFieldRenderer } from '@oida/ui-react-antd';
import { useMapAoiDrawerFromModule } from '@oida/ui-react-mst';

import { useAnalysisGeometryFromModule } from './use-analysis-geometry';

export type AnalysisAoiFilterProps = {
    analysis: IDatasetAnalysis
    supportedGeometries: GeometryTypes[];
};

export const AnalysisAoiFilter = (props: AnalysisAoiFilterProps) => {
    let geometryValue = useObserver(() => props.analysis.geometry);

    let aoiDrawerConfig = useMapAoiDrawerFromModule({
        value: geometryValue ? {
            geometry: geometryValue
        } : undefined,
        onChange: (value) => {
            props.analysis.setGeometry(value ? value.geometry : undefined);
        }
    });

    let analysisGeometryState = useAnalysisGeometryFromModule(props.analysis);

    let aoiFilterConfig = {
        ...aoiDrawerConfig,
        ...analysisGeometryState,
        supportedGeometries: props.supportedGeometries
    };

    delete aoiFilterConfig.onLinkToViewportAction;

    return (
        <AoiFieldRenderer
            config={aoiFilterConfig}
            value={geometryValue ? {
                geometry: geometryValue
            } : undefined}
            onChange={(value) => {
                props.analysis.setGeometry(value ? value.geometry : undefined);
            }}
        />
    );
};
