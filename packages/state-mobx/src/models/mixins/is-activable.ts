import { makeObservable, observable, action } from 'mobx';

export type ActiveProps = {
    active?: boolean;
};

export class Active {
    @observable value: boolean;
    constructor(props?: ActiveProps) {
        this.value = props?.active !== undefined ? props.active : true;
        makeObservable(this);
    }

    @action
    setValue(value: boolean) {
        this.value = value;
    }
}

export interface IsActivable {
    active: Active;
}
