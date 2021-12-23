import { IObservableArray, observe } from 'mobx';

export type ArrayTrackerConfig<T, S> = {
    idGetter?: (item: T) => string;
    items: IObservableArray<T>;
    onItemAdd: (item: T, idx: number) => S;
    onItemRemove: (trackerState: S) => void;
};

export class ArrayTracker<T, S> {
    protected stateSubscription_;
    protected trackerConfig_: ArrayTrackerConfig<T, S>;
    protected itemTracker_: Record<string, S> = {};
    protected idGetter_: (item: T) => string;

    constructor(config: ArrayTrackerConfig<T, S>) {
        this.trackerConfig_ = config;
        this.idGetter_ = this.trackerConfig_.idGetter || ((item) => item['id']);
        this.bindToCollectionState_();
    }

    forEachItem(callback: (item: S) => void) {
        for (const id in this.itemTracker_) {
            callback(this.itemTracker_[id]);
        }
    }

    destroy() {
        this.unbindFromCollectionState_();
    }

    protected bindToCollectionState_() {
        this.stateSubscription_ = observe(
            this.trackerConfig_.items,
            (change) => {
                if (change.type === 'splice') {
                    let idx = change.index;

                    change.removed.forEach((item) => {
                        this.onItemRemoved_(this.idGetter_(item));
                    });

                    change.added.forEach((item) => {
                        this.onItemAdd_(this.idGetter_(item), item, idx++);
                    });
                } else if (change.type === 'update') {
                    const idx = change.index;
                    this.onItemRemoved_(this.idGetter_(change.oldValue));
                    this.onItemAdd_(this.idGetter_(change.newValue), change.newValue, idx);
                }
            },
            true
        );
    }

    protected unbindFromCollectionState_() {
        for (const id in this.itemTracker_) {
            this.onItemRemoved_(id);
        }
        this.stateSubscription_();
    }

    protected onItemAdd_(id: string, item: T, idx: number) {
        this.itemTracker_[id] = this.trackerConfig_.onItemAdd(item, idx);
    }

    protected onItemRemoved_(id) {
        const itemTracker = this.itemTracker_[id];
        this.trackerConfig_.onItemRemove(itemTracker);
        delete this.itemTracker_[id];
    }
}
