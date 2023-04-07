import { action, makeObservable, observable } from 'mobx';

export type DiscreteColorMapItem = {
    value: string;
    color: string;
};

export type DiscreteColorMapProps = {
    items: DiscreteColorMapItem[];
};

export class DiscreteColorMap {
    @observable.ref mapItems: Record<string, string>;

    constructor(props: DiscreteColorMapProps) {
        this.mapItems = {};
        props.items.forEach((value) => {
            this.mapItems[value.value] = value.color;
        });
        makeObservable(this);
    }

    @action
    setColorMapItemColor(value: string, color: string) {
        this.mapItems = { ...this.mapItems, [value]: color };
    }
}
