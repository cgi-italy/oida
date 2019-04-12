import React from 'react';
import { observer } from 'mobx-react';

import { IMapProjection } from '@oida/core';
import { IMapView } from '@oida/state-mst';

import { ChoiceSelectorRenderer } from '@oida/ui-react-core';

import { MapModule, DefaultMapModule } from '../map-module';
import { injectFromModuleState, injectFromModuleConfig } from '../../with-app-module';


export type ProjectionItem<T> = {
    name: string;
} & IMapProjection & T;

export type ProjSelectorProps<T> = {
    projections: ProjectionItem<T>[];
    mapView: IMapView;
    render: ChoiceSelectorRenderer<T>;
};

class ProjSelectorBase<T> extends React.Component<ProjSelectorProps<T>> {

    onProjectionSelect(code) {
        let projection = this.props.projections.find((projection) => {
            return projection.code === code;
        });

        if (projection) {
            this.props.mapView.setProjection(projection);
        }
    }

    render() {

        let { render, projections, mapView, ...props } = this.props;

        let items = projections.map((projection) => {

            return Object.assign({
                value: projection.code,
            }, projection);

        });

        return render({
            value: mapView.projection.code,
            items: items,
            onSelect: this.onProjectionSelect.bind(this)
        });
    }
}

export const MapProjSelector = observer(ProjSelectorBase);

export const injectMapProjSelectorStateFromModule = (mapModule: MapModule) => injectFromModuleState(mapModule, (moduleState) => {
    return {
        mapView: moduleState.map.view
    };
});


export const injectMapProjectionsFromModuleConfig = (mapModule: MapModule) => injectFromModuleConfig(mapModule, (moduleConfig) => {
    return {
        projections: moduleConfig.projections
    };
});

export const MapProjSelectorS = injectMapProjSelectorStateFromModule(DefaultMapModule)(MapProjSelector);
export const MapProjSelectorSC = injectMapProjectionsFromModuleConfig(DefaultMapModule)(MapProjSelectorS);
