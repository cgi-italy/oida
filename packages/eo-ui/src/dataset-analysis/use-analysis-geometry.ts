import { useObserver } from 'mobx-react';

import { SelectionMode } from '@oida/core';
import { useMapModuleState } from '@oida/ui-react-mst';
import { IDatasetAnalysis } from '@oida/eo';
import { IMap, IEntitySelection } from '@oida/state-mst';

export type useAnalysisGeometryProps = {
    analysis: IDatasetAnalysis;
    map: IMap;
    mapSelection: IEntitySelection;
};

export const useAnalysisGeometry = (props: useAnalysisGeometryProps) => {

    let { mapSelection, map, analysis} = props;

    const onAnalysisHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(analysis);
        } else {
            mapSelection.setHovered(null);
        }
    };

    const onAnalysisSelect = (selected) => {
        mapSelection.modifySelection(analysis, SelectionMode.Replace);
    };

    let aoiProps = useObserver(() => {
        return {
            color: analysis.color,
            name: analysis.datasetViz.aoi ? analysis.datasetViz.aoi.name : 'None'
        };
    });

    return {
        onHoverAction: onAnalysisHover,
        onSelectAction: onAnalysisSelect,
        color: aoiProps.color,
        name: aoiProps.name
    };
};


export const useAnalysisGeometryFromModule = (analysis: IDatasetAnalysis, mapModule?) => {
    let moduleState = useMapModuleState(mapModule);

    return useAnalysisGeometry({
        mapSelection: moduleState.selection!,
        map: moduleState.map,
        analysis
    });
};

