import { SelectionMode } from '@oidajs/core';
import { useCenterOnMap, useMapModule, useSelector } from '@oidajs/ui-react-mobx';
import { DatasetProcessing } from '@oidajs/eo-mobx';
import { Map, SelectionManager } from '@oidajs/state-mobx';

export type useAnalysisGeometryProps = {
    analysis: DatasetProcessing<any>;
    map: Map;
    mapSelection: SelectionManager;
};

export const useAnalysisGeometry = (props: useAnalysisGeometryProps) => {

    const { mapSelection, map, analysis} = props;

    const centerOnMap = useCenterOnMap({
        map: map
    });

    const onAnalysisHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(analysis);
        } else {
            mapSelection.setHovered(undefined);
        }
    };

    const onAnalysisSelect = (selected) => {
        mapSelection.selection.modifySelection(analysis, SelectionMode.Replace);
        if (props.analysis.geometry) {
            centerOnMap(props.analysis.geometry, {
                animate: true
            });
        }
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


export const useAnalysisGeometryFromModule = (analysis: DatasetProcessing<any>, mapModuleId?: string) => {
    let moduleState = useMapModule(mapModuleId);

    return useAnalysisGeometry({
        mapSelection: moduleState.selectionManager,
        map: moduleState.map,
        analysis
    });
};

