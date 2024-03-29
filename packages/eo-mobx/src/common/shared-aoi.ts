import { computed, action, observable, makeObservable } from 'mobx';
import { HasGeometry, GeometryProps, GeometryState } from '@oidajs/state-mobx';

export type SharedAoiProps = {
    name?: string;
} & GeometryProps;

export class SharedAoi implements HasGeometry {
    protected static nextAoiId_ = 1;

    geometry: GeometryState;

    @observable protected name_: string | undefined;
    @observable protected referenceCount_: number;

    protected aoiId_: number;

    constructor(props: SharedAoiProps) {
        this.referenceCount_ = 0;
        this.geometry = new GeometryState(props);
        this.name_ = props.name;

        this.aoiId_ = SharedAoi.nextAoiId_++;
        makeObservable(this);
    }

    get shared() {
        return this.referenceCount_ > 1;
    }

    @computed
    get name() {
        return this.name_ || `${this.geometry.value.type} ${this.aoiId_}`;
    }

    @action
    setName(name: string | undefined) {
        this.name_ = name;
    }

    @action
    ref() {
        this.referenceCount_++;
    }

    @action
    unref() {
        this.referenceCount_--;
    }
}
