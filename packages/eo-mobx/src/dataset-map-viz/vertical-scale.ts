import { makeObservable, observable, action } from 'mobx';

export type VerticalScaleProps = {
    verticalScale?: number;
};

export class VerticalScale {
    @observable value: number;

    constructor(props?: VerticalScaleProps) {
        this.value = props?.verticalScale || 1;
        makeObservable(this);
    }

    @action
    setValue(value: number) {
        this.value = value;
    }
}
