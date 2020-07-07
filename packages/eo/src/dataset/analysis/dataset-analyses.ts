import { types, Instance, SnapshotOrInstance, SnapshotIn } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';

import { createEntityCollectionType, FeatureLayer, createEntityReference } from '@oida/state-mst';

import { ComboAnalysis, IComboAnalysis } from './combo-analysis';
import { DatasetAnalysis, IDatasetAnalysis } from './dataset-analysis';

const DatasetAnalysesDecl = types.model('DatasetAnalyses', {
    collection: createEntityCollectionType(types.late(() => DatasetAnalysis)),
    geometryLayer: types.maybe(FeatureLayer),
    comboAnalyses: types.map(types.late(() => ComboAnalysis)),
    active: types.optional(types.boolean, false)
}).actions(self => ({
    setActive: (active: boolean) => {
        self.active = active;
    },
    addAnalysis: (
        analysis: SnapshotOrInstance<typeof DatasetAnalysis>,
        parent: string | SnapshotIn<typeof ComboAnalysis>,
        idx?: number
    ) => {
        let parentCombo : IComboAnalysis | undefined;
        if (typeof parent === 'string') {
            parentCombo = self.comboAnalyses.get(parent);
        } else {
            parentCombo = self.comboAnalyses.put(parent);
        }
        if (!parentCombo) {
            return;
        }

        let analysisInstance = self.collection.itemWithId(analysis.id);
        if (!analysisInstance) {
            analysisInstance = self.collection.add(analysis);
        }
        if (idx === undefined || idx > parentCombo.analyses.length || idx < 0) {
            parentCombo.analyses.push(createEntityReference(analysisInstance));
        } else {
            parentCombo.analyses.splice(idx, 0, createEntityReference(analysisInstance));
        }
    },
    removeAnalysis: (analysis: SnapshotOrInstance<typeof DatasetAnalysis> | string) => {
        if (typeof(analysis) === 'string') {
            self.collection.removeItemWithId(analysis);
        } else {
            self.collection.removeItemWithId(analysis.id);
        }
    },
    moveAnalysis: (analysis: IDatasetAnalysis, options: {currentComboId: string, targetComboId?: string, idx?: number}) => {
        let currentCombo = self.comboAnalyses.get(options.currentComboId);
        if (!currentCombo) {
            return;
        }
        let targetCombo: IComboAnalysis | undefined;
        if (options.targetComboId) {
            targetCombo = self.comboAnalyses.get(options.targetComboId);
        } else {
            targetCombo = ComboAnalysis.create({
                id: uuid(),
                name: currentCombo.name,
                type: currentCombo.type
            });
            self.comboAnalyses.put(targetCombo);
        }

        if (!targetCombo) {
            return;
        }

        const analysisReference = createEntityReference(analysis);
        if (options.idx === undefined || options.idx > targetCombo.analyses.length || options.idx < 0) {
            targetCombo.analyses.push(analysisReference);
        } else {
            targetCombo.analyses.splice(options.idx, 0, analysisReference);
        }

        currentCombo.analyses.remove(analysis);
    },
    removeComboAnalysis: (comboId: string) => {
        let combo = self.comboAnalyses.get(comboId);
        if (combo) {
            combo.analyses.forEach((analysis) => {
                self.collection.removeItemWithId(analysis.id);
            });
            self.comboAnalyses.delete(comboId);
        }
    },
    afterAttach: () => {
        self.geometryLayer = FeatureLayer.create({
            id: 'analysesGeometries',
            source: self.collection.id,
            config: {
                onEntityHover: (analysis: IDatasetAnalysis, coordinates) => {
                    analysis.datasetViz.aoi?.setHoveredPosition(coordinates);
                },
                geometryGetter: (analysis: IDatasetAnalysis) => {
                    return analysis.datasetViz.mapGeometry;
                },
                rendererOptions: {
                    cesium: {
                        entityMode: false,
                        coordPickMode: 'ellipsoid'
                    }
                }
            }
        });
    }
})).views((self) => {
    return {
        getLinkedAoiIds: () => {
            let linkedAoisTotal: Record<string, number> = {};
            const aoiIds = new Set<string>();

            self.collection.items.forEach((item) => {
                let aoiId = item.datasetViz.aoi?.id;
                if (aoiId) {
                    linkedAoisTotal[aoiId] = (linkedAoisTotal[aoiId] || 0) + 1;
                    if (linkedAoisTotal[aoiId] > 1) {
                        aoiIds.add(aoiId);
                    }
                }
            });

            return aoiIds;
        }
    };
});

type DatasetAnalysesType = typeof DatasetAnalysesDecl;
export interface DatasetAnalysesInterface extends DatasetAnalysesType {}
export const DatasetAnalyses: DatasetAnalysesInterface = DatasetAnalysesDecl;
export interface IDatasetAnalyses extends Instance<DatasetAnalysesInterface> {}
