import { useEffect } from 'react';
import { useObserver } from 'mobx-react';

import { getGeometryExtent, SelectionMode } from '@oida/core';
import { IEntitySelection, IMap } from '@oida/state-mst';
import {  AoiValue, FormFieldState } from '@oida/ui-react-core';

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
            map.renderer.implementation!.fitExtent(getGeometryExtent(aoiInstance.geometry), true);
        }
    };

    let aoiProps = useObserver(() => {
        let aoiInstance = getAoiInstance();
        if (aoiInstance) {
            return {
                color: aoiInstance.color,
                name: aoiInstance.name
            };
        } else {
            return {
                color: null,
                name: value && value.props && value.props.fromViewport ? 'Current viewport' : 'None'
            };
        }
    });

    return {
        onHoverAction: onAoiHover,
        onSelectAction: onAoiSelect,
        color: aoiProps.color,
        name: aoiProps.name
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

