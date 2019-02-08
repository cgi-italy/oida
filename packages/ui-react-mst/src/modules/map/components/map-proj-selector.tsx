import React from 'react';
import { observer } from 'mobx-react';

import { IMapProjection } from '@oida/core';
import { IMapView } from '@oida/state-mst';

import { ChoiceSelectorRenderer } from '@oida/ui-react-core';


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

        this.props.mapView.setProjection(projection);
    }

    render() {

        let { render, projections, mapView, ...props } = this.props;

        let value = projections.find((projection) => {
            return projection.code === mapView.projection.code;
        }).code;

        let items = projections.map((projection) => {

            return Object.assign({
                value: projection.code,
            }, projection);

        });

        return render({
            value: value,
            items: items,
            onSelect: this.onProjectionSelect.bind(this)
        });
    }
}

export const MapProjSelector = observer(ProjSelectorBase);
