import { IObservableArray, observable, action, makeObservable } from 'mobx';
import { v4 as uuid } from 'uuid';

import { Visible, VisibleProps } from '@oida/state-mobx';

import { DatasetProcessing } from './dataset-processing';


let nextAnalysisIdx = 1;
export const generateAnalysisName = (type: string) => {
    return `${type} ${nextAnalysisIdx++}`;
};

export type DatasetAnalysisProps<T extends DatasetProcessing<any> = DatasetProcessing<any>> = {
    type: string;
    name?: string;
    processings?: T[];
    destroyOnClose?: boolean;
} & VisibleProps;

/**
 * A base class for a dataset analysis operation.
 * An analysis includes one or more {@link DatasetProcessing}
 */
export class DatasetAnalysis<T extends DatasetProcessing<any> = DatasetProcessing<any>> {
    readonly id: string;
    readonly type: string;
    readonly destroyOnClose: boolean;
    readonly visible: Visible;
    readonly processings: IObservableArray<T>;
    @observable.ref name: string;

    constructor(props: DatasetAnalysisProps<T>) {
        this.id = uuid();
        this.type = props.type;
        this.name = props.name || generateAnalysisName(props.type);
        this.destroyOnClose = typeof(props.destroyOnClose) === 'boolean' ? props.destroyOnClose : true;
        this.visible = new Visible(props);
        this.processings = observable.array(props.processings || [], {
            deep: false
        });

        makeObservable(this);
    }

    @action
    addProcessing(processing: T, idx?: number) {
        if (typeof(idx) === 'number' && idx < this.processings.length) {
            this.processings.splice(idx, 0, processing);
        } else {
            this.processings.push(processing);
        }
    }

    @action
    removeProcessing(processing: T, noDispose?: boolean) {
        this.processings.remove(processing);
        if (!noDispose) {
            processing.dispose();
        }
    }

    @action
    setName(name: string) {
        this.name = name;
    }

    dispose() {
        this.processings.forEach((processing) => {
            processing.dispose();
        });
    }

}
