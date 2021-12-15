import { MapView } from '@oidajs/state-mobx';

import { useSelector } from '../../../core';
import { MapProjectionConfig } from '../map-module';
import { useMapModule } from './use-map-module';


export type ProjSelectorProps = {
    projections: MapProjectionConfig[];
    mapView: MapView;
};

export const useMapProjectionSelector = (props: ProjSelectorProps) => {

    const {mapView, projections} = props;

    return useSelector(() => ({
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

export const useMapProjectionSelectorFromModule = (mapModuleid?: string) => {
    let mapModuleState = useMapModule(mapModuleid);
    return useMapProjectionSelector({
        mapView: mapModuleState.map.view,
        projections: mapModuleState.config.projections || []
    });
};

