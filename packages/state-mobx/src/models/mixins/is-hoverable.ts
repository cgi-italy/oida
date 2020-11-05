import { makeObservable, observable, action } from 'mobx';

export type HoveredProps = {
    hovered?: boolean;
};

export class Hovered {
    @observable value: boolean;
    constructor(props?: HoveredProps) {
        this.value = props?.hovered !== undefined ? props.hovered : false;
        makeObservable(this);
    }

    @action
    setValue(value: boolean) {
        this.value = value;
    }
}

export interface IsHoverable {
    hovered: Hovered;
}
