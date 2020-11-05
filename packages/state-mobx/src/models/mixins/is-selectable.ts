import { makeObservable, observable, action } from 'mobx';

export type SelectedProps = {
    selected?: boolean;
};

export class Selected {
    @observable value: boolean;
    constructor(props?: SelectedProps) {
        this.value = props?.selected !== undefined ? props.selected : false;
        makeObservable(this);
    }

    @action
    setValue(value: boolean) {
        this.value = value;
    }
}

export interface IsSelectable {
    selected: Selected;
}
