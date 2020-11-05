import { makeObservable, observable, action } from 'mobx';

export type VisibleProps = {
    visible?: boolean;
};

export class Visible {
    @observable value: boolean;
    constructor(props?: VisibleProps) {
        this.value = props?.visible !== undefined ? props.visible : true;
        makeObservable(this);
    }

    @action
    setValue(value: boolean) {
        this.value = value;
    }
}

export interface HasVisibility {
    visible: Visible;
}
