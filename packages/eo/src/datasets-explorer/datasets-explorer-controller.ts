import { autorun, when } from 'mobx';
import { isValidReference, addDisposer, isAlive } from 'mobx-state-tree';

import { GroupLayer, ArrayTracker, createEntityReference } from '@oida/state-mst';

import { IDatasetsExplorer } from './datasets-explorer';

export class DatasetsExplorerController {

    protected datasetsExplorer_: IDatasetsExplorer;
    protected datasetsTracker_;

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

    protected applyCommonFilters_(datasetView) {
        this.datasetsExplorer_.commonFilters.items.forEach((filter) => {
            datasetView.dataset.searchParams.filters.set(filter.key, filter.value);
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
                    datasetView.dataset.searchParams.filters.set(filter.key, filter.value, filter.type);
                } else if (change.type === 'delete') {
                    let filter = change.oldValue.value;
                    datasetView.dataset.searchParams.filters.unset(filter.key);
                }
            });
        });
        addDisposer(this.datasetsExplorer_, filterTrackerDisposer);

        if (!this.datasetsExplorer_.config.disableTimeExplorer) {
            addDisposer(this.datasetsExplorer_, autorun(() => {
                let toi = this.datasetsExplorer_.toi;
                if (toi) {
                    this.datasetsExplorer_.timeExplorer.visibleRange.makeRangeVisible(
                        toi.start, toi.end, 0.2, true
                    );
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

                this.applyCommonFilters_(datasetView);

                let disposers: any[] = [];

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
                    let productExplorerLayer = this.datasetsExplorer_.productExplorer.mapLayer;
                    if (productExplorerLayer) {

                        let layerReference = createEntityReference(datasetView.productSearchViz.mapLayer!);
                        productExplorerLayer.children.add(layerReference, this.datasetsExplorer_.datasetViews.length - idx - 1);

                        disposers.push(() => {
                            productExplorerLayer!.children.remove(layerReference);
                        });
                    }
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

                return disposers;

            },
            onItemRemove: (disposers) => {
                //@ts-ignore
                disposers.forEach(disposer => disposer());
            }
        });

    }
}
