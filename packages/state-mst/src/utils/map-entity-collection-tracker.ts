export type MapEntityCollectionTrackerConfig<T> = {
    collection;
    onEntityAdd(entity, idx?: number): T;
    onEntityRemove(trackerState: T): void;
};

export class MapEntityCollectionTracker<T> {

    protected stateSubscription_;
    protected trackerConfig_: MapEntityCollectionTrackerConfig<T>;
    protected itemTracker_: {[id: string] : T} = {};

    constructor(config: MapEntityCollectionTrackerConfig<T>) {
        this.trackerConfig_ = config;
        this.bindToCollectionState_();
    }

    destroy() {
        this.unbindFromCollectionState_();
    }

    protected bindToCollectionState_() {
        this.stateSubscription_ = this.trackerConfig_.collection.items.observe((change) => {
            if (change.type === 'splice') {
                let idx = change.index;

                change.removed.forEach((mapEntity: any) => {
                    this.onEntityRemoved_(mapEntity.snapshot.id);
                });

                change.added.forEach((mapEntity: any) => {
                    this.onEntityAdd_(mapEntity.value, idx++);
                });

            } else if (change.type === 'update') {
                let idx = change.index;
                this.onEntityRemoved_(change.oldValue.id);
                this.onEntityAdd_(change.newValue, idx);
            }
        });

        this.trackerConfig_.collection.items.forEach((mapEntity, idx) => {
            this.onEntityAdd_(mapEntity, idx);
        });
    }

    protected unbindFromCollectionState_() {
        for (let id in this.itemTracker_) {
            this.onEntityRemoved_(id);
        }
        this.stateSubscription_();
    }

    protected onEntityAdd_(mapEntity, idx) {
        this.itemTracker_[mapEntity.id] = this.trackerConfig_.onEntityAdd(mapEntity, idx);
    }

    protected onEntityRemoved_(id) {
        let itemTracker = this.itemTracker_[id];
        this.trackerConfig_.onEntityRemove(itemTracker);
        delete this.itemTracker_[id];
    }
}
