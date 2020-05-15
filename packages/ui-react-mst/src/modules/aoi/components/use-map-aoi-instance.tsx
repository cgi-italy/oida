import { useEffect } from 'react';
import { useObserver } from 'mobx-react';

import { getGeometryExtent, SelectionMode, AoiValue, FormFieldState } from '@oida/core';
import { IEntitySelection, IMap } from '@oida/state-mst';

import { useCenterOnMap } from '../../map';

import { useAoiModuleState } from '../use-aoi-module-state';
import { IAOICollection } from '../types/aoi';

export type MapAoiInstanceProps = {
    mapSelection: IEntitySelection;
    map: IMap;
    aois: IAOICollection;
} & FormFieldState<AoiValue>;


export const useMapAoiInstance = ({ mapSelection, aois, map, value}: MapAoiInstanceProps) => {

    useEffect(() => {

        if (value) {

            let aoiInstance = getAoiInstance();
            if (aoiInstance) {
                aoiInstance.setVisible(true);
            }

            return () => {
                let aoiInstance = getAoiInstance();
                if (aoiInstance) {
                    aoiInstance.setVisible(false);
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
            mapSelection.setHovered(null);
        }
    };

    const onAoiSelect = (selected) => {
        let aoiInstance = getAoiInstance();
        mapSelection.modifySelection(aoiInstance, SelectionMode.Replace);
        if (aoiInstance) {
            centerOnMap(aoiInstance.geometry, {
                animate: true
            });
        }
    };

    let aoiProps = useObserver(() => {
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

export const useMapAoiInstanceFromModule = (aoiFieldState: FormFieldState<AoiValue>, aoiModule?) => {
    let moduleState = useAoiModuleState(aoiModule);


    return useMapAoiInstance({
        mapSelection: moduleState.mapModule.selection!,
        aois: moduleState.aois,
        map: moduleState.map,
        ...aoiFieldState
    });
};

