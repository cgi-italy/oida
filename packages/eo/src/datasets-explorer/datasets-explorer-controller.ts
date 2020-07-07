import { autorun, when } from 'mobx';
import { isValidReference, addDisposer, isAlive } from 'mobx-state-tree';

import { QueryFilter, CancelablePromise } from '@oida/core';
import { GroupLayer, ArrayTracker, createEntityReference } from '@oida/state-mst';

import { DATASET_SELECTED_TIME_FILTER_KEY } from '../dataset/dataset';
import { IDatasetsExplorer, IDatasetExplorerView } from './datasets-explorer';
import { TimeSearchDirection } from '../dataset/time-distribution/dataset-time-distribution-provider';
import { getNearestDatasetProduct } from '../utils/dataset-time-utils';

export class DatasetsExplorerController {

    protected datasetsExplorer_: IDatasetsExplorer;
    protected datasetsTracker_;
    protected pendingNearestTimeRequests_: Record<string, CancelablePromise<any>> = {};

    constructor(datasetExplorer: IDatasetsExplorer) {
        this.datasetsExplorer_ = datasetExplorer;
        this.createMapLayers_();
    }

    protected createMapLayers_() {

        when(() => isValidReference(() => this.datasetsExplorer_.mapLayer), () => {

            let layerGroup = this.datasetsExplorer_.mapLayer;

            if (!this.datasetsExplorer_.config.disableProductSearch) {
                let searchResultsLayer = GroupLayer.create({
                    id: 'explorerSearchResults'
                });

                this.datasetsExplorer_.setProductExplorerMapLayer(searchResultsLayer);

                let searchLayerReference = createEntityReference(searchResultsLayer);
                layerGroup.children.add(searchLayerReference);

                let searchResultsLayerVisibilityDisposer = autorun(() => {
                    searchResultsLayer.setVisible(this.datasetsExplorer_.productExplorer.active);
                });

                addDisposer(this.datasetsExplorer_, () => {
                    searchResultsLayerVisibilityDisposer();
                    this.datasetsExplorer_.mapLayer.children.remove(searchLayerReference);
                });
            }

            if (!this.datasetsExplorer_.config.disableMapView) {
                let viewsLayer = GroupLayer.create({
                    id: 'explorerDatasetViews'
                });

                this.datasetsExplorer_.setVizExplorerMapLayer(viewsLayer);
                let viewsLayerReference = createEntityReference(viewsLayer);
                layerGroup.children.add(viewsLayerReference);

                let searchResultsLayerVisibilityDisposer = autorun(() => {
                    viewsLayer.setVisible(this.datasetsExplorer_.vizExplorer.active);
                });

                addDisposer(this.datasetsExplorer_, () => {
                    searchResultsLayerVisibilityDisposer();
                    this.datasetsExplorer_.mapLayer.children.remove(viewsLayerReference);
                });
            }

            let geometryLayer = this.datasetsExplorer_.analyses.geometryLayer;
            if (geometryLayer) {

                let analysisLayerReference = createEntityReference(geometryLayer);

                layerGroup.children.add(analysisLayerReference);

                let analysisLayerVisibilityDisposer = autorun(() => {
                    geometryLayer!.setVisible(this.datasetsExplorer_.analyses.active);
                });

                addDisposer(this.datasetsExplorer_, () => {
                    analysisLayerVisibilityDisposer();
                    this.datasetsExplorer_.mapLayer.children.remove(analysisLayerReference);
                });

            }

            this.bindToExplorerState_();

        });

    }

    protected updateSelectedDate_() {
        let selectedDate = this.datasetsExplorer_.selectedDate;
        if (!selectedDate && !this.datasetsExplorer_.toi) {
            selectedDate = new Date();
        }
        if (selectedDate) {
            return getNearestDatasetProduct(
                selectedDate,
                TimeSearchDirection.Backward,
                this.datasetsExplorer_.datasetViews
            ).then((date) => {
                if (date) {
                    this.datasetsExplorer_.setSelectedDate(date);
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    protected applyFilter_(datasetView: IDatasetExplorerView, filter: QueryFilter) {
        const timeDistributionProvider = datasetView.dataset.config.timeDistribution?.provider;
        if (
            filter.key === DATASET_SELECTED_TIME_FILTER_KEY
            && filter.value !== undefined
            && this.datasetsExplorer_.vizExplorer.nearestMatch
            && timeDistributionProvider
        ) {
            if (this.pendingNearestTimeRequests_[datasetView.dataset.id]) {
                this.pendingNearestTimeRequests_[datasetView.dataset.id].cancel();
                delete this.pendingNearestTimeRequests_[datasetView.dataset.id];
            }
            this.pendingNearestTimeRequests_[datasetView.dataset.id] = timeDistributionProvider.getNearestItem(
                filter.value, TimeSearchDirection.Backward
            ).then((item) => {
                if (!isAlive(datasetView)) {
                    return;
                }
                let currentDatasetTime = datasetView.dataset.searchParams.filters.get(DATASET_SELECTED_TIME_FILTER_KEY);
                let nearestMatch = item ? item.start : filter.value;
                if (!currentDatasetTime || currentDatasetTime.getTime() !== nearestMatch.getTime()) {
                    datasetView.dataset.searchParams.filters.set(
                        filter.key,
                        nearestMatch,
                        filter.type
                    );
                }
            });
        } else {
            datasetView.dataset.searchParams.filters.set(filter.key, filter.value, filter.type);
        }
    }

    protected applyCommonFilters_(datasetView: IDatasetExplorerView) {
        this.datasetsExplorer_.commonFilters.items.forEach((filter) => {
            this.applyFilter_(datasetView, filter);
        });
    }

    protected bindToExplorerState_() {

        this.datasetsExplorer_.datasetViews.forEach((datasetView) => {
            this.applyCommonFilters_(datasetView);
        });

        let filterTrackerDisposer = this.datasetsExplorer_.commonFilters.items.observe((change) => {
            this.datasetsExplorer_.datasetViews.forEach((datasetView) => {
                if (change.type === 'add' || change.type === 'update') {
                    let filter = change.newValue.value;
                    this.applyFilter_(datasetView, filter);
                } else if (change.type === 'delete') {
                    let filter = change.oldValue.value;
                    datasetView.dataset.searchParams.filters.unset(filter.key);
                }
            });
        });
        addDisposer(this.datasetsExplorer_, filterTrackerDisposer);

        if (!this.datasetsExplorer_.config.disableTimeExplorer) {

            addDisposer(this.datasetsExplorer_, autorun(() => {
                let selectedDate = this.datasetsExplorer_.selectedDate;
                let toi = this.datasetsExplorer_.toi;
                if (selectedDate) {
                    this.datasetsExplorer_.timeExplorer.visibleRange.centerDate(selectedDate, {
                        notIfVisible: true,
                        animate: true
                    });
                } else if (toi) {
                    this.datasetsExplorer_.timeExplorer.visibleRange.centerRange(toi.start, toi.end, {
                        notIfVisible: true,
                        animate: true,
                        margin: 0.2
                    });
                }
            }));
        }

        this.datasetsTracker_ = new ArrayTracker({
            items: this.datasetsExplorer_.datasetViews,
            idGetter: (datasetView) => {
                //@ts-ignore
                return datasetView.dataset.id;
            },
            onItemAdd: (datasetView, idx) => {

                let disposers: any[] = [];

                this.updateSelectedDate_().then(() => {

                    if (!isAlive(datasetView)) {
                        return;
                    }

                    this.applyCommonFilters_(datasetView);

                    if (datasetView.timeDistributionViz) {
                        disposers.push(autorun(() => {
                            let timeExplorer = this.datasetsExplorer_.timeExplorer;
                            let active = timeExplorer.active;
                            let timeRange = timeExplorer.visibleRange.range;
                            if (active) {
                                datasetView.timeDistributionViz!.setSearchParams({
                                    ...timeRange,
                                    resolution: timeExplorer.visibleRange.resolution
                                });
                            }
                        }));
                    }

                    if (datasetView.productSearchViz) {
                        let productExplorer = this.datasetsExplorer_.productExplorer;

                        let productExplorerLayer = productExplorer.mapLayer;
                        if (productExplorerLayer) {

                            let layerReference = createEntityReference(datasetView.productSearchViz.mapLayer!);
                            productExplorerLayer.children.add(layerReference, this.datasetsExplorer_.datasetViews.length - idx - 1);

                            disposers.push(() => {
                                productExplorerLayer!.children.remove(layerReference);
                            });
                        }

                        disposers.push(autorun(() => {
                            let active = productExplorer.active;
                            datasetView.productSearchViz?.setActive(active);
                        }));
                    }

                    if (datasetView.mapViz) {
                        let mapViewsLayer = this.datasetsExplorer_.vizExplorer.mapLayer;
                        if (mapViewsLayer && datasetView.mapViz.mapLayer) {

                            let layerReference = createEntityReference(datasetView.mapViz.mapLayer!);
                            mapViewsLayer.children.add(layerReference, this.datasetsExplorer_.datasetViews.length - idx - 1);

                            disposers.push(() => {
                                mapViewsLayer!.children.remove(layerReference);
                            });
                        }
                    }
                });

                return disposers;

            },
            onItemRemove: (disposers) => {
                this.updateSelectedDate_();
                //@ts-ignore
                disposers.forEach(disposer => disposer());
            }
        });

    }
}
