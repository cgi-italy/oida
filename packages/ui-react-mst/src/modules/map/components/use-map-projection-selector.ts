import { useObserver } from 'mobx-react';

import { IMapProjection } from '@oida/core';
import { IMapView } from '@oida/state-mst';

import { useMapModuleState } from '../use-map-module-state';

export type ProjectionItem = {
    name: string;
} & IMapProjection;

export type ProjSelectorProps = {
    projections: ProjectionItem[];
    mapView: IMapView;
};

export const useMapProjectionSelector = ({mapView, projections}: ProjSelectorProps) => {
    return useObserver(() => ({
        items: projections.map((projection) => {
            let { code, name }  = projection;
            return {
                value: code,
                name: name
            };
        }),
        value: mapView.projection.code,
        onSelect: (code) => {
            let projection = projections.find((projection) => {
                return projection.code === code;
            });

            if (projection) {
                mapView.setProjection(projection);
            }
        }
    }));
};

export const useMapProjectionSelectorFromModule = (mapModule?) => {
    let mapModuleState = useMapModuleState(mapModule);
    return useMapProjectionSelector({
        mapView: mapModuleState.map.view,
        projections: mapModuleState.config.projections || []
    });
};

