import { types, Instance, SnapshotOrInstance, getParentOfType } from 'mobx-state-tree';

import { EntitySafeReference, hasVisibility } from '@oida/state-mst';

import { DatasetAnalyses } from './dataset-analyses';
import { DatasetAnalysis, IDatasetAnalysis } from './dataset-analysis';

const ComboAnalysisDecl = types.compose(
    'ComboAnalysis',
    types.model({
        id: types.identifier,
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
        undockAnalysis: (analysis: IDatasetAnalysis) => {
            let analyses = getParentOfType(self, DatasetAnalyses);
            if (analyses) {
                analyses.moveAnalysis(analysis, {
                    currentComboId: self.id
                });
            }
        }
    };
});

type ComboAnalysisType = typeof ComboAnalysisDecl;
export interface ComboAnalysisInterface extends ComboAnalysisType {}
export const ComboAnalysis: ComboAnalysisInterface = ComboAnalysisDecl;
export interface IComboAnalysis extends Instance<ComboAnalysisInterface> {}
