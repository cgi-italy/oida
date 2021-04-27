import { SelectionMode } from '@oida/core';
import { useMapModule, useSelector } from '@oida/ui-react-mobx';
import { DatasetAnalysis } from '@oida/eo-mobx';
import { Map, SelectionManager } from '@oida/state-mobx';

export type useAnalysisGeometryProps = {
    analysis: DatasetAnalysis<any>;
    map: Map;
    mapSelection: SelectionManager;
};

export const useAnalysisGeometry = (props: useAnalysisGeometryProps) => {

    let { mapSelection, map, analysis} = props;

    const onAnalysisHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(analysis);
        } else {
            mapSelection.setHovered(undefined);
        }
    };

    const onAnalysisSelect = (selected) => {
        mapSelection.selection.modifySelection(analysis, SelectionMode.Replace);
    };

    let aoiProps = useSelector(() => {
        return {
            color: analysis.color,
            name: analysis.aoi ? analysis.aoi.name : 'None'
        };
    }, [props.analysis]);

    return {
        onHoverAction: onAnalysisHover,
        onSelectAction: onAnalysisSelect,
        color: aoiProps.color,
        name: aoiProps.name
    };
};


export const useAnalysisGeometryFromModule = (analysis: DatasetAnalysis<any>, mapModuleId?: string) => {
    let moduleState = useMapModule(mapModuleId);

    return useAnalysisGeometry({
        mapSelection: moduleState.selectionManager,
        map: moduleState.map,
        analysis
    });
};

