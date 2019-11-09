import { types, Instance, detach, addDisposer, SnapshotIn, SnapshotOrInstance, getSnapshot, applySnapshot } from 'mobx-state-tree';

import { GroupLayer, DataFilters, needsConfig } from '@oida/state-mst';
import { Dataset, DatasetConfig, DatasetTimeDistributionViz, DatasetProductSearchViz, DatasetMapViz, TimeRange } from '../dataset';

import { DatasetsExplorerController } from './datasets-explorer-controller';


const DatasetExplorerView = types.model('DatasetExplorerViews', {
    dataset: Dataset,
    timeDistributionViz: types.maybe(DatasetTimeDistributionViz),
    productSearchViz: types.maybe(DatasetProductSearchViz),
    mapViz: types.maybe(DatasetMapViz.Type)
});

export type DatasetsExplorerConfig = {
    aoiFilterKey: string;
    toiFilterKey: string;
    disableTimeExplorer?: boolean;
    disableProductSearch?: boolean;
    disableMapView?: boolean;
};

export const DatasetsExplorer = types.compose(
    'DatasetsExplorer',
    types.model( {
        datasetViews: types.array(DatasetExplorerView),
        commonFilters: types.optional(DataFilters, {}),
        showFilters: types.optional(types.boolean, true),
        timeExplorer: types.model({
            active: types.optional(types.boolean, false),
            visibleRange: TimeRange
        }),
        productExplorer: types.optional(types.model({
            active: types.optional(types.boolean, false),
            mapLayer: types.maybe(GroupLayer)
        }), {}),
        vizExplorer: types.optional(types.model({
            active: types.optional(types.boolean, false),
            mapLayer: types.maybe(GroupLayer)
        }), {}),
        mapLayer: types.reference(GroupLayer)
    }),
    needsConfig<DatasetsExplorerConfig>()
)
.views((self) => {
    return {
        getDatasetView: (id: string) => {
            return self.datasetViews.find(datasetView => datasetView.dataset.id === id);
        },
        get aoi() {
            return self.commonFilters.get(self.config.aoiFilterKey);
        },
        get toi() {
            return self.commonFilters.get(self.config.toiFilterKey);
        }
    };
})
.actions((self) => {
    return {
        setAoi: (aoi) => {
            self.commonFilters.set(self.config.aoiFilterKey, aoi);
        },
        setToi: (toi) => {
            self.commonFilters.set(self.config.toiFilterKey, toi);
        },
        setFilterVisibility: (visible: boolean) => {
            self.showFilters = visible;
        },
        setProductExplorerActive: (active: boolean) => {
            if (active && self.config.disableProductSearch) {
                throw new Error('Product search is disabled in configuration');
            }
            self.productExplorer.active = active;
        },
        setProductExplorerMapLayer: (mapLayer) => {
            self.productExplorer.mapLayer = mapLayer;
        },
        setVizExplorerActive: (active: boolean) => {
            if (active && self.config.disableProductSearch) {
                throw new Error('Viz explorer is disabled in configuration');
            }
            self.vizExplorer.active = active;
        },
        setVizExplorerMapLayer: (mapLayer) => {
            self.vizExplorer.mapLayer = mapLayer;
        },
        addDataset: (datasetConfig: DatasetConfig) => {
            let dataset = Dataset.create({id: datasetConfig.id, searchParams: {}});
            dataset.init(datasetConfig);

            let datasetViewConfig: any = {
                dataset: dataset
            };

            if (!self.config.disableMapView && datasetConfig.mapView) {
                let DatasetViewType = DatasetMapViz.getSpecificType(datasetConfig.mapView.type);
                if (DatasetViewType) {
                    let mapViz = DatasetViewType.create({
                        dataset: dataset.id,
                    });
                    mapViz.init(datasetConfig.mapView.config);

                    datasetViewConfig.mapViz = mapViz;
                }
            }

            if (!self.config.disableProductSearch && datasetConfig.search) {
                let productSearchViz = DatasetProductSearchViz.create({
                    dataset: dataset.id
                });

                productSearchViz.init(datasetConfig.search);
                datasetViewConfig.productSearchViz = productSearchViz;
            }

            if (!self.config.disableTimeExplorer && datasetConfig.timeDistribution) {

                let range = self.timeExplorer.visibleRange.range;
                let timeDistributionViz = DatasetTimeDistributionViz.create({
                    dataset: dataset.id,
                    searchParams: {
                        start: range.start,
                        end: range.end
                    }
                });

                timeDistributionViz.init(datasetConfig.timeDistribution);

                datasetViewConfig.timeDistributionViz = timeDistributionViz;
            }

            let datasetView = DatasetExplorerView.create(datasetViewConfig);
            self.datasetViews.push(datasetView);
            return datasetView;
        },
        removeDataset: (id: string) => {
            let datasetView = self.getDatasetView(id);
            if (datasetView) {
                self.datasetViews.remove(datasetView);
            }
        },
        moveDataset: (idx, newIdx) => {
            let datasetView = self.datasetViews[idx];
            if (datasetView) {
                // let itemsSnapshot = getSnapshot(self.datasetViews).slice();
                // let itemSnapshot = itemsSnapshot[idx];
                // itemsSnapshot.splice(idx, 1);
                // itemsSnapshot.splice(newIdx, 0, itemSnapshot);
                // applySnapshot(self.datasetViews, itemsSnapshot);
                detach(datasetView);
                self.datasetViews.splice(newIdx, 0, datasetView);
            }
        }
    };
}).actions((self) => {
    return {
        afterAttach: () => {
            let tracker = new DatasetsExplorerController(self as any);
        }
    };
});

export type IDatasetsExplorer = Instance<typeof DatasetsExplorer>;

