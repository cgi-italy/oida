import { useEffect } from 'react';

import { SelectionMode, AoiValue, FormFieldState } from '@oida/core';
import { IndexedCollection, Map, SelectionManager } from '@oida/state-mobx';

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

    useEffect(() => {

        if (value) {

            let aoiInstance = getAoiInstance();
            if (aoiInstance) {
                aoiInstance.visible.setValue(true);
            }

            return () => {
                let aoiInstance = getAoiInstance();
                if (aoiInstance) {
                    aoiInstance.visible.setValue(false);
                }
            };

        }
    }, [value]);

    const centerOnMap = useCenterOnMap({
        map: map
    });

    const getAoiInstance = () => {
        if (value && value.props && value.props.id) {
            return aois.itemWithId(value.props.id);
        } else {
            return undefined;
        }
    };

    const onAoiHover = (hovered) => {
        if (hovered) {
            mapSelection.setHovered(getAoiInstance());
        } else {
            mapSelection.setHovered(undefined);
        }
    };

    const onAoiSelect = (selected) => {
        let aoiInstance = getAoiInstance();
        mapSelection.selection.modifySelection(aoiInstance, SelectionMode.Replace);
        if (aoiInstance) {
            centerOnMap(aoiInstance.geometry.value, {
                animate: true
            });
        }
    };

    let aoiProps = useSelector(() => {
        let aoiInstance = getAoiInstance();
        if (aoiInstance) {
            return {
                color: aoiInstance.color,
                name: aoiInstance.name
            };
        }
    });

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

