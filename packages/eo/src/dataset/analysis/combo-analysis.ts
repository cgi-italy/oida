import { types, Instance, SnapshotOrInstance, getParentOfType, addDisposer } from 'mobx-state-tree';
import { when } from 'mobx';

import { v4 as uuid } from 'uuid';

import { EntitySafeReference, hasVisibility } from '@oida/state-mst';

import { DatasetAnalyses } from './dataset-analyses';
import { DatasetAnalysis, IDatasetAnalysis } from './dataset-analysis';

let nextComboIdx = 1;
export const generateComboAnalysisName = (type: string) => {
    return `${type} ${nextComboIdx++}`;
};

const ComboAnalysisDecl = types.compose(
    'ComboAnalysis',
    types.model({
        id: types.optional(types.identifier, () => uuid()),
        type: types.string,
        name: types.maybe(types.string),
        analyses: types.array(EntitySafeReference(types.late(() => DatasetAnalysis))),
        destroyOnClose: types.optional(types.boolean, true)
    }),
    hasVisibility
).actions((self) => {

    return {
        addAnalysis: (analysis: SnapshotOrInstance<typeof DatasetAnalysis>, idx?: number) => {
            let analyses = getParentOfType(self, DatasetAnalyses);
            if (analyses) {
                analyses.addAnalysis(analysis, self.id, idx);
            }
        },
        removeAnalysis: (analysis: SnapshotOrInstance<typeof DatasetAnalysis> | string) => {
            let analyses = getParentOfType(self, DatasetAnalyses);
            if (analyses) {
                analyses.removeAnalysis(analysis);
            }
        },
        moveAnalysis: (analysis: IDatasetAnalysis, target?: string) => {
            let analyses = getParentOfType(self, DatasetAnalyses);
            if (analyses) {
                analyses.moveAnalysis(analysis, {
                    currentComboId: self.id,
                    targetComboId: target
                });
            }
        },
        afterAttach: () => {
            addDisposer(self, when(() => !self.analyses.length, () => {
                let analyses = getParentOfType(self, DatasetAnalyses);
                if (analyses) {
                    analyses.removeComboAnalysis(self.id);
                }
            }));
        }
    };
});

type ComboAnalysisType = typeof ComboAnalysisDecl;
export interface ComboAnalysisInterface extends ComboAnalysisType {}
export const ComboAnalysis: ComboAnalysisInterface = ComboAnalysisDecl;
export interface IComboAnalysis extends Instance<ComboAnalysisInterface> {}
