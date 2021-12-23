import { observable, makeObservable, computed, IObservableArray, action } from 'mobx';

export type TimeDistributionItemProps<T> = {
    start: Date;
    end?: Date;
    data?: T;
};

export class TimeDistributionItem<T> {
    @observable.ref start: Date;
    @observable.ref end: Date | undefined;
    @observable.ref data: T | undefined;

    constructor(props: TimeDistributionItemProps<T>) {
        this.start = props.start;
        this.end = props.end;
        this.data = props.data;
        makeObservable(this);
    }

    @computed
    get isRange() {
        return this.end !== undefined && this.start.getTime() < this.end.getTime();
    }

    @computed
    get isoString() {
        const itemString = `${this.start.toISOString()}`;
        return this.isRange ? `${itemString}/${this.end!.toISOString()}` : itemString;
    }
}

export type TimeDistributionProps<T> = {
    items?: (TimeDistributionItem<T> | TimeDistributionItemProps<T>)[];
};

export class TimeDistribution<T> {
    items: IObservableArray<TimeDistributionItem<T>>;

    constructor(props?: TimeDistributionProps<T>) {
        this.items = observable.array([]);
        if (props?.items) {
            this.setItems(props.items);
        }
        makeObservable(this);
    }

    @action
    setItems(items: (TimeDistributionItem<T> | TimeDistributionItemProps<T>)[]) {
        this.items.replace(
            items.map((item) => {
                if (item instanceof TimeDistributionItem) {
                    return item;
                } else {
                    return new TimeDistributionItem(item);
                }
            })
        );
    }
}
