import { observable, action, makeObservable } from 'mobx';

export type DatasetDimensionsProps<T extends string | number | Date = string | number | Date> = {
    dimensionValues?: Record<string, T>
};

export class DatasetDimensions<T extends string | number | Date = string | number | Date> {
    readonly values = observable.map<string, T>({}, {
        deep: false
    });

    constructor(props: DatasetDimensionsProps<T>) {
        if (props.dimensionValues) {
            this.values.merge(props.dimensionValues);
        }
        makeObservable(this);
    }

    @action
    setValue(dimension: string, value: T) {
        this.values.set(dimension, value);
    }

    @action
    unsetValue(dimension: string) {
        this.values.delete(dimension);
    }
}

export interface HasDatasetDimensions {
    dimensions: DatasetDimensions;
}
