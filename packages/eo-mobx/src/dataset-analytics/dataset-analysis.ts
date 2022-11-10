import { IObservableArray, observable, action, makeObservable } from 'mobx';
import { v4 as uuid } from 'uuid';

import { Visible, VisibleProps } from '@oidajs/state-mobx';

import { DatasetProcessing, DatasetProcessingSnapshot } from './dataset-processing';
import { DatasetViz } from '../common';
import { createDynamicFactory } from '@oidajs/core';

let nextAnalysisIdx = 1;
export const generateAnalysisName = (type: string) => {
    return `${type} ${nextAnalysisIdx++}`;
};

export type DatasetAnalysisProps<T extends string = string, P extends DatasetProcessing<string, any> = DatasetProcessing<string, any>> = {
    type: T;
    id?: string;
    name?: string;
    processings?: P[];
    /** when set the analysis is automatically destroyed when closed on when emptied (all processings removed) */
    destroyOnClose?: boolean;
} & VisibleProps;

export interface DatasetAnalysisDefinitions extends Record<string, DatasetAnalysisProps> {}
export interface DatasetAnalysisTypes extends Record<string, DatasetAnalysis> {}

export type DatasetAnalysisDefinition<TYPE extends string = Extract<keyof DatasetAnalysisDefinitions, string>> = {
    type: TYPE;
} & TYPE extends keyof DatasetAnalysisDefinitions
    ? DatasetAnalysisDefinitions[TYPE]
    : DatasetAnalysisProps<TYPE>;

export type DatasetAnalysisType<TYPE extends string = Extract<keyof DatasetAnalysisTypes, string>> = TYPE extends keyof DatasetAnalysisTypes
    ? DatasetAnalysisTypes[TYPE]
    : DatasetAnalysis<TYPE>;

export type DatasetAnalysisSnapshot<TYPE extends string = string> = {
    id: string;
    type: TYPE;
    name: string;
    visible: boolean;
    processings: DatasetProcessingSnapshot[];
};

const datasetAnalysisFactory = createDynamicFactory<DatasetAnalysis>('datasetAnalysisFactory');

/**
 * A base class for a dataset analysis operation.
 * An analysis includes one or more {@link DatasetProcessing}
 */
export class DatasetAnalysis<T extends string = string, P extends DatasetProcessing<string, any> = DatasetProcessing<string, any>> {
    protected static instances_: Map<string, WeakRef<DatasetAnalysis>> = new Map();

    static create<TYPE extends string>(props: DatasetAnalysisDefinition<TYPE>): DatasetAnalysisType<TYPE> {
        const datasetAnalysis = datasetAnalysisFactory.create(props.type, props);
        if (!datasetAnalysis) {
            throw new Error(`datasetAnalysis.create: Unable to create analysis of type ${props.type}`);
        }
        return datasetAnalysis as DatasetAnalysisType<TYPE>;
    }

    static register<TYPE extends string, A extends DatasetAnalysis<TYPE>>(
        analysisType: TYPE,
        analysisCtor: new (props: Omit<DatasetAnalysisDefinition<TYPE>, 'type'>) => A
    ) {
        datasetAnalysisFactory.register(analysisType, (props) => {
            return new analysisCtor(props);
        });
    }

    static createFromSnapshot<TYPE extends string>(snapshot: DatasetAnalysisSnapshot<TYPE>) {
        const processings = snapshot.processings.map((processingSnaphsot) => {
            return DatasetViz.createFromSnapshot(processingSnaphsot) as DatasetProcessing<string, any>;
        });
        return DatasetAnalysis.create({
            ...snapshot,
            processings: processings
        });
    }

    static getInstance(id: string) {
        return DatasetAnalysis.instances_.get(id)?.deref();
    }

    readonly id: string;
    readonly type: T;
    readonly destroyOnClose: boolean;
    readonly visible: Visible;
    readonly processings: IObservableArray<P>;
    @observable.ref name: string;

    constructor(props: DatasetAnalysisProps<T, P>) {
        this.id = props.id || uuid();
        this.type = props.type;
        this.name = props.name || generateAnalysisName(props.type);
        this.destroyOnClose = typeof props.destroyOnClose === 'boolean' ? props.destroyOnClose : true;
        this.visible = new Visible(props);
        this.processings = observable.array(props.processings || [], {
            deep: false
        });

        DatasetAnalysis.instances_.set(this.id, new WeakRef(this));

        makeObservable(this);
    }

    @action
    addProcessing(processing: P, idx?: number) {
        if (typeof idx === 'number' && idx < this.processings.length) {
            this.processings.splice(idx, 0, processing);
        } else {
            this.processings.push(processing);
        }
    }

    @action
    removeProcessing(processing: P, noDispose?: boolean) {
        this.processings.remove(processing);
        if (!noDispose) {
            processing.dispose();
        }
    }

    @action
    clearProcessings() {
        this.processings.forEach((processing) => {
            processing.dispose();
        });
        this.processings.clear();
    }

    @action
    setName(name: string) {
        this.name = name;
    }

    getSnapshot(): DatasetAnalysisSnapshot<T> {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            visible: this.visible.value,
            processings: this.processings.map((processing) => {
                return processing.getSnapshot();
            })
        };
    }

    @action
    applySnapshot(snapshot: DatasetAnalysisSnapshot<T>) {
        this.name = snapshot.name;
        this.visible.setValue(snapshot.visible);
        this.clearProcessings();
        snapshot.processings.forEach((processingSnapshot) => {
            try {
                const processing = DatasetViz.createFromSnapshot(processingSnapshot);
                this.addProcessing(processing as P);
            } catch (e) {
                console.warn(`Skipping processing: ${e}`);
            }
        });
    }

    dispose() {
        this.processings.forEach((processing) => {
            processing.dispose();
        });
        DatasetAnalysis.instances_.delete(this.id);
    }
}
