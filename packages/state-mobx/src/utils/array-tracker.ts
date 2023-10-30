import { IObservableArray, observe } from 'mobx';

export type ArrayTrackerConfig<T, S> = {
    idGetter?: (item: T) => string;
    items: IObservableArray<T>;
    onItemAdd: (item: T, idx: number) => S;
    onItemRemove: (trackerState: S) => void;
    onItemMove?: (item: T, prevIndex: number, newIndex: number) => void;
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
        let potentialMove: { timeout: number; item: T; prevIndex: number } | undefined;

        const onItemMove = this.trackerConfig_.onItemMove;

        this.stateSubscription_ = observe(
            this.trackerConfig_.items,
            (change) => {
                if (change.type === 'splice') {
                    if (onItemMove) {
                        // try to detect the "move" event as a remove, immediately followed by an add
                        if (potentialMove) {
                            // there is a pending remove
                            clearTimeout(potentialMove.timeout);
                            if (change.removed.length === 0 && change.added.length === 1 && change.added[0] === potentialMove.item) {
                                // move event
                                onItemMove(potentialMove.item, potentialMove.prevIndex, change.index);
                                potentialMove = undefined;
                                return;
                            } else {
                                // no add after remove. propagate remove event
                                this.onItemRemoved_(this.idGetter_(potentialMove.item));
                                potentialMove = undefined;
                            }
                        } else {
                            if (change.removed.length === 1 && change.added.length === 0) {
                                // remove event. wait to propagate to check if it is a "move"
                                potentialMove = {
                                    item: change.removed[0],
                                    prevIndex: change.index,
                                    timeout: setTimeout(() => {
                                        // no other events after remove. propagate remove event
                                        if (potentialMove) {
                                            this.onItemRemoved_(this.idGetter_(potentialMove.item));
                                        }
                                        potentialMove = undefined;
                                    })
                                };
                                return;
                            }
                        }
                    }

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
        if (Object.prototype.hasOwnProperty.call(this.itemTracker_, id)) {
            this.onItemRemoved_(id);
        }
        this.itemTracker_[id] = this.trackerConfig_.onItemAdd(item, idx);
    }

    protected onItemRemoved_(id) {
        if (Object.prototype.hasOwnProperty.call(this.itemTracker_, id)) {
            const itemTracker = this.itemTracker_[id];
            this.trackerConfig_.onItemRemove(itemTracker);
            delete this.itemTracker_[id];
        }
    }
}
