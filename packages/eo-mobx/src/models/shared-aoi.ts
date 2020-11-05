import {
    HasGeometry, GeometryProps, GeometryState,
} from '@oida/state-mobx';
import { computed, action, observable, makeObservable } from 'mobx';


export type SharedAoiProps = {
} & GeometryProps;

export class SharedAoi implements HasGeometry {
    geometry: GeometryState;

    @observable protected referenceCount_: number;

    constructor(props: SharedAoiProps) {
        this.referenceCount_ = 0;
        this.geometry = new GeometryState(props);

        makeObservable(this);
    }

    get shared() {
        return this.referenceCount_ > 1;
    }

    @computed
    get name() {
        return `${this.geometry.value.type}`;
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
