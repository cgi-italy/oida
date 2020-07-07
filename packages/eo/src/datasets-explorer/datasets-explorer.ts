import { types, Instance, detach, addDisposer, SnapshotIn, SnapshotOrInstance, getSnapshot, applySnapshot } from 'mobx-state-tree';
import moment from 'moment';

import { AOI_FIELD_ID, AoiValue, DATE_RANGE_FIELD_ID, DateRangeValue, DATE_FIELD_ID } from '@oida/core';
import { GroupLayer, DataFilters, hasConfig } from '@oida/state-mst';
import {
    Dataset, DatasetConfig, IDataset,
    DatasetTimeDistributionViz, DatasetProductSearchViz,
    DatasetViz, DatasetVizType, TimeRange,
    DATASET_AOI_FILTER_KEY, DATASET_TIME_RANGE_FILTER_KEY, DATASET_SELECTED_TIME_FILTER_KEY
} from '../dataset';

import { DatasetAnalyses } from '../dataset/analysis/dataset-analyses';

import { DatasetsExplorerController } from './datasets-explorer-controller';

const DatasetExplorerViewDecl = types.model('DatasetExplorerViews', {
    dataset: Dataset,
    timeDistributionViz: types.maybe(DatasetTimeDistributionViz),
    productSearchViz: types.maybe(DatasetProductSearchViz),
    mapViz: types.maybe(DatasetVizType)
});

type DatasetExplorerViewType = typeof DatasetExplorerViewDecl;
export interface DatasetExplorerViewInterface extends DatasetExplorerViewType {}
const DatasetExplorerView: DatasetExplorerViewInterface = DatasetExplorerViewDecl;
export interface IDatasetExplorerView extends Instance<DatasetExplorerViewInterface> {}

export type DatasetsExplorerConfig = {
    disableTimeExplorer?: boolean;
    disableProductSearch?: boolean;
    disableMapView?: boolean;
};

const DatasetsExplorerDecl = types.compose(
    'DatasetsExplorer',
    types.model( {
        datasetViews: types.array(DatasetExplorerView),
        commonFilters: types.optional(DataFilters, {}),
        timeExplorer: types.model({
            active: types.optional(types.boolean, false),
            visibleRange: types.optional(TimeRange, {
                start: moment().subtract(1, 'month').toDate(),
                end: moment().toDate(),
                resolution: undefined
            })
        }),
        productExplorer: types.optional(types.model({
            active: types.optional(types.boolean, false),
            mapLayer: types.maybe(GroupLayer)
        }), {}),
        vizExplorer: types.optional(types.model({
            active: types.optional(types.boolean, false),
            mapLayer: types.maybe(GroupLayer),
            nearestMatch: types.optional(types.boolean, true)
        }), {}),
        mapLayer: types.reference(GroupLayer),
        analyses: types.optional(DatasetAnalyses, {
            collection: {}
        })
    }),
    hasConfig<DatasetsExplorerConfig>()
)
.views((self) => {
    return {
        getDatasetView: (id: string) => {
            return self.datasetViews.find(datasetView => datasetView.dataset.id === id) as IDatasetExplorerView | undefined;
        },
        get aoi(): AoiValue | undefined {
            return self.commonFilters.get(DATASET_AOI_FILTER_KEY);
        },
        get toi(): DateRangeValue | undefined {
            return self.commonFilters.get(DATASET_TIME_RANGE_FILTER_KEY);
        },
        get selectedDate(): Date | undefined {
            return self.commonFilters.get(DATASET_SELECTED_TIME_FILTER_KEY);
        }
    };
})
.actions((self) => {
    return {
        setAoi: (aoi) => {
            self.commonFilters.set(DATASET_AOI_FILTER_KEY, aoi, AOI_FIELD_ID);
        },
        setToi: (toi) => {
            self.commonFilters.set(DATASET_TIME_RANGE_FILTER_KEY, toi, DATE_RANGE_FIELD_ID);
        },
        setSelectedDate: (date: Date | undefined) => {
            if (date) {
                self.commonFilters.set(DATASET_SELECTED_TIME_FILTER_KEY, date, DATE_FIELD_ID);
            } else {
                self.commonFilters.unset(DATASET_SELECTED_TIME_FILTER_KEY);
            }
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

            let dataset = Dataset.create({
                id: datasetConfig.id,
                searchParams: {},
                config: datasetConfig
            });

            let datasetViewConfig: any = {
                dataset: dataset
            };

            if (!self.config.disableMapView && datasetConfig.mapView) {
                let DatasetViewType = DatasetViz.getSpecificType(datasetConfig.mapView.type);
                if (DatasetViewType) {
                    datasetViewConfig.mapViz = DatasetViewType.create({
                        dataset: dataset.id,
                        config: datasetConfig.mapView.config
                    });
                }
            }

            if (!self.config.disableProductSearch && datasetConfig.search) {
                datasetViewConfig.productSearchViz = DatasetProductSearchViz.create({
                    dataset: dataset.id,
                    config: datasetConfig.search,
                    active: self.productExplorer.active
                });
            }

            if (!self.config.disableTimeExplorer && datasetConfig.timeDistribution) {

                let range = self.timeExplorer.visibleRange.range;

                datasetViewConfig.timeDistributionViz = DatasetTimeDistributionViz.create({
                    dataset: dataset.id,
                    searchParams: {
                        start: range.start,
                        end: range.end,
                        resolution: self.timeExplorer.visibleRange.resolution
                    },
                    active: self.timeExplorer.active,
                    config: datasetConfig.timeDistribution
                });
            }

            let datasetView = DatasetExplorerView.create(datasetViewConfig);
            self.datasetViews.push(datasetView);

            if (datasetView.mapViz) {
                self.analyses.addAnalysis({
                    datasetViz: datasetView.mapViz.id,
                    id: `${datasetView.mapViz.id}Analysis`,
                }, {
                    id: `${datasetView.mapViz.id}ComboAnalysis`,
                    type: datasetView.mapViz.datasetVizType,
                    name: dataset.config.name,
                    destroyOnClose: false
                });
            }
            return datasetView as IDatasetExplorerView;
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

type DatasetsExplorerType = typeof DatasetsExplorerDecl;
export interface DatasetsExplorerInterface extends DatasetsExplorerType {}
export const DatasetsExplorer: DatasetsExplorerInterface = DatasetsExplorerDecl;
export interface IDatasetsExplorer extends Instance<DatasetsExplorerInterface> {}

