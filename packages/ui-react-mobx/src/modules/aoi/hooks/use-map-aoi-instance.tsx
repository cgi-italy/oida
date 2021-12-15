import { useEffect, useMemo } from 'react';

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


    useEffect(() => {

        if (aoiInstance) {

            aoiInstance.visible.setValue(true);

            return () => {
                if (aoiInstance) {
                    aoiInstance.visible.setValue(false);
                }
            };

        }
    }, [aoiInstance]);

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
        mapSelection.selection.modifySelection(aoiInstance, SelectionMode.Replace);
        if (aoiInstance) {
            centerOnMap(aoiInstance.geometry.value, {
                animate: true
            });
        }
    };

    let aoiProps = useSelector(() => {
        if (aoiInstance) {
            return {
                color: aoiInstance.color,
                name: aoiInstance.name
            };
        }
    }, [aoiInstance]);

    return {
        onHoverAction: onAoiHover,
        onSelectAction: onAoiSelect,
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

