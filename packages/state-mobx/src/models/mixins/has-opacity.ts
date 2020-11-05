import { makeObservable, observable, action } from 'mobx';

export type OpacityProps = {
    opacity?: number;
};

export class Opacity {
    @observable value: number;
    constructor(props?: OpacityProps) {
        this.value = props?.opacity !== undefined ? props.opacity : 1.0;
        makeObservable(this);
    }

    @action
    setValue(value: number) {
        this.value = value;
    }
}

export interface HasOpacity {
    opacity: Opacity;
}
