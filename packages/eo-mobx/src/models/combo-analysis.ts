import { IObservableArray, observable, action, makeObservable } from 'mobx';
import { v4 as uuid } from 'uuid';

import { Visible, VisibleProps } from '@oida/state-mobx';

import { DatasetAnalyses } from './dataset-analyses';
import { DatasetAnalysis } from './dataset-analysis';


let nextComboIdx = 1;
export const generateComboAnalysisName = (type: string) => {
    return `${type} ${nextComboIdx++}`;
};

export type ComboAnalysisProps<T extends DatasetAnalysis<any> = DatasetAnalysis<any>> = {
    type: string;
    name: string;
    parent: DatasetAnalyses;
    analyses?: T[];
    destroyOnClose?: boolean;
} & VisibleProps;

export class ComboAnalysis<T extends DatasetAnalysis<any> = DatasetAnalysis<any>> {
    readonly id: string;
    readonly type: string;
    readonly name: string;
    readonly destroyOnClose: boolean;
    readonly visible: Visible;
    analyses: IObservableArray<T>;

    protected parent_: DatasetAnalyses;

    constructor(props: ComboAnalysisProps<T>) {
        this.id = uuid();
        this.type = props.type;
        this.name = props.name;
        this.destroyOnClose = typeof(props.destroyOnClose) === 'boolean' ? props.destroyOnClose : true;
        this.visible = new Visible(props);
        this.analyses = observable.array([], {
            deep: false
        });
        this.parent_ = props.parent;
        props.analyses?.forEach((analysis) => {
            this.addAnalysis(analysis);
        });

        makeObservable(this);
    }

    @action
    addAnalysis(analysis: DatasetAnalysis<any>, idx?: number) {
        this.parent_.addAnalysis(analysis, this, idx);
    }

    @action
    removeAnalysis(analysis: DatasetAnalysis<any>, noDisposeOnEmpty?: boolean) {
        this.parent_.removeAnalysis(analysis, this, noDisposeOnEmpty);
    }

    @action
    moveAnalysis(analysis: DatasetAnalysis<any>, target?: ComboAnalysis) {
        this.parent_.moveAnalysis(analysis, {
            source: this,
            target: target
        });
    }

    dispose() {}

}
