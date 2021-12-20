import { useMemo } from 'react';

import { SelectionMode, AoiValue, FormFieldState } from '@oidajs/core';
import { IndexedCollection, Map, SelectionManager } from '@oidajs/state-mobx';

import { useSelector } from '../../../core';
import { useCenterOnMap } from '../../map';
import { useAoiModule } from './use-aoi-module';
import { Aoi } from '../models/aoi';


export type MapAoiInstanceProps = {
    mapSelection: SelectionManager;
    map: Map;
    aois: IndexedCollection<Aoi>;
} & FormFieldState<AoiValue>;


export const useMapAoiInstance = (props: MapAoiInstanceProps) => {

    const { mapSelection, aois, map, value} = props;

    const aoiInstance = useMemo(() => {
        const aoiId = value?.props?.id;
        if (aoiId) {
            return aois.itemWithId(aoiId);
        }
    }, [value]);

    const centerOnMap = useCenterOnMap({
        map: map
    });

    const onAoiHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(aoiInstance);
        } else {
            mapSelection.setHovered(undefined);
        }
    };

    const onAoiSelect = (selected) => {
        mapSelection.selection.modifySelection(selected ? aoiInstance : undefined, SelectionMode.Replace);
        if (aoiInstance) {
            centerOnMap(aoiInstance.geometry.value, {
                animate: true
            });
        }
    };

    const onAoiVisibilityChange = (visible) => {
        if (aoiInstance) {
            aoiInstance.visible.setValue(visible);
        }
    };

    const onAoiCenterOnMap = () => {
        if (aoiInstance) {
            centerOnMap(aoiInstance.geometry.value, {
                animate: true
            });
        }
    };

    const aoiProps = useSelector(() => {
        if (aoiInstance) {
            return {
                color: aoiInstance.color,
                name: aoiInstance.name
            };
        }
    }, [aoiInstance]);

    const aoiState = useSelector(() => {
        if (aoiInstance) {
            return {
                visible: aoiInstance.visible.value,
                selected: aoiInstance.selected.value,
                hovered: aoiInstance.hovered.value
            };
        } else {
            return {
                visible: false,
                selected: false,
                hovered: false
            };
        }
    }, [aoiInstance]);

    return {
        onHoverAction: onAoiHover,
        onSelectAction: onAoiSelect,
        onVisibleAction: onAoiVisibilityChange,
        onCenterAction: onAoiCenterOnMap,
        state: aoiState,
        ...aoiProps
    };
};

export const useMapAoiInstanceFromModule = (aoiFieldState: FormFieldState<AoiValue>, aoiModuleId?: string) => {
    let moduleState = useAoiModule(aoiModuleId);

    return useMapAoiInstance({
        mapSelection: moduleState.mapModule.selectionManager,
        aois: moduleState.aois,
        map: moduleState.mapModule.map,
        ...aoiFieldState
    });
};

