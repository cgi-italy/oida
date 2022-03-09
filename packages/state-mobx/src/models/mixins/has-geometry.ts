import { makeObservable, observable, computed, action } from 'mobx';

import { Geometry, getGeometryExtent } from '@oidajs/core';

type GeometryType = Geometry | (Geometry | undefined);

export type GeometryProps<T extends GeometryType = Geometry> = {
    geometry: T;
};

export class GeometryState<T extends GeometryType = Geometry> {
    @observable.ref value: T;

    constructor(props: GeometryProps<T>) {
        this.value = props.geometry;

        makeObservable(this);
    }

    @computed
    get bounds() {
        if (this.value !== undefined) {
            return getGeometryExtent(this.value as Geometry);
        } else {
            return undefined;
        }
    }

    @action
    setValue(value: T) {
        this.value = value;
    }
}

export interface HasGeometry<T extends GeometryType = Geometry> {
    geometry: GeometryState<T>;
}

export type OptionalGeometryProps = Partial<GeometryProps>;
export type OptionalGeometryState = GeometryState<Geometry | undefined>;
export type HasOptionalGeometry = HasGeometry<Geometry | undefined>;
