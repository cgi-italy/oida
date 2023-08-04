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
        props.items.forEach((item) => {
            this.mapItems[item.value] = item.color;
        });
        makeObservable(this);
    }

    @action
    setColorMapItemColor(value: string, color: string) {
        this.mapItems = { ...this.mapItems, [value]: color };
    }

    getSnapshot(): DiscreteColorMapProps {
        return {
            items: Object.entries(this.mapItems).map(([value, color]) => {
                return {
                    value: value,
                    color: color
                };
            })
        };
    }
}
