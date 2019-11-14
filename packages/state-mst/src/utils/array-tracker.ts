import { IAnyType, IArrayType, Instance, SnapshotOrInstance, isReferenceType, getType } from 'mobx-state-tree';

export type ArrayTrackerConfig<T, ITEM extends IAnyType = IAnyType> = {
    idGetter?: (item: SnapshotOrInstance<ITEM>) => string;
    items: Instance<IArrayType<ITEM>>;
    onItemAdd: (item: Instance<ITEM>, idx: number) => T;
    onItemRemove: (trackerState: T) => void;
};

export class ArrayTracker<T, ITEM extends IAnyType = IAnyType> {

    protected stateSubscription_;
    protected trackerConfig_: ArrayTrackerConfig<T, ITEM>;
    protected itemTracker_: {[id: string] : T} = {};
    protected idGetter_: (item: SnapshotOrInstance<ITEM>) => string;

    constructor(config: ArrayTrackerConfig<T, ITEM>) {
        this.trackerConfig_ = config;
        this.idGetter_ = this.trackerConfig_.idGetter || (item => item['id']);
        this.bindToCollectionState_();
    }

    forEachItem(callback: (T) => void) {
        for (let id in this.itemTracker_) {
            callback(this.itemTracker_[id]);
        }
    }

    destroy() {
        this.unbindFromCollectionState_();
    }

    protected bindToCollectionState_() {
        this.stateSubscription_ = this.trackerConfig_.items.observe((change) => {
            if (change.type === 'splice') {
                let idx = change.index;

                change.removed.forEach((item) => {
                    if (isReferenceType(item.type)) {
                        this.onItemRemoved_(item.snapshot);
                    } else {
                        this.onItemRemoved_(this.idGetter_(item.snapshot));
                    }
                });

                change.added.forEach((item) => {
                    if (isReferenceType(item.type)) {
                        this.onItemAdd_(item.snapshot, item.value, idx++);
                    } else {
                        this.onItemAdd_(this.idGetter_(item.value), item.value, idx++);
                    }
                });

            } else if (change.type === 'update') {
                let idx = change.index;
                this.onItemRemoved_(this.idGetter_(change.oldValue));
                this.onItemAdd_(this.idGetter_(change.newValue), change.newValue, idx);
            }
        });

        this.trackerConfig_.items.forEach((item, idx) => {
            if (isReferenceType(getType(item))) {
                this.onItemAdd_(item.snapshot, item, idx);
            } else {
                this.onItemAdd_(this.idGetter_(item), item, idx);
            }
        });
    }

    protected unbindFromCollectionState_() {
        for (let id in this.itemTracker_) {
            this.onItemRemoved_(id);
        }
        this.stateSubscription_();
    }

    protected onItemAdd_(id, item, idx) {
        this.itemTracker_[id] = this.trackerConfig_.onItemAdd(item, idx);
    }

    protected onItemRemoved_(id) {
        let itemTracker = this.itemTracker_[id];
        this.trackerConfig_.onItemRemove(itemTracker);
        delete this.itemTracker_[id];
    }
}
