import { autorun } from 'mobx';
import { types, Instance, addDisposer, applySnapshot, onSnapshot } from 'mobx-state-tree';
import debounce from 'lodash/debounce';

import { LoadingState, CancelablePromise } from '@oida/core';

import { MapLayer, hasLoadingState,
    needsConfig
} from '@oida/state-mst';

import { DatasetProducts } from './dataset-product';
import { DatasetProductSearchConfig } from './dataset-product-search-config';
import { DatasetViz } from '../dataset-viz';
import { createGeometrySearchResultsLayer } from './layer-factories/create-geometry-search-results-layer';

const datasetProductResultsUpdater = (datasetProductSearchViz: IDatasetProductSearchViz) => {

    let searchDisposer = autorun(() => {
        let criteria = datasetProductSearchViz.dataset.searchParams.data;
        let active = datasetProductSearchViz.active;
        if (active) {
            datasetProductSearchViz.searchProducts();
        }
    });

    return searchDisposer;
};


export const DatasetProductSearchViz = DatasetViz.addModel(
    types.compose(
        'DatasetProductSearchViz',
        types.model({
            products: types.optional(DatasetProducts, {}),
            mapLayer: types.maybe(MapLayer.Type)
        }),
        hasLoadingState,
        needsConfig<DatasetProductSearchConfig>()
    ).actions((self) => {
        let pendingSearchRequest: CancelablePromise<any> | undefined = undefined;

        return {
            searchProducts: () => {

                if (pendingSearchRequest) {
                    pendingSearchRequest.cancel();
                    pendingSearchRequest = undefined;
                }

                self.setLoadingState(LoadingState.Loading);
                pendingSearchRequest = self.config.searchProvider.searchProducts(
                    (self as IDatasetProductSearchViz).dataset.searchParams.data
                ).then((response) => {
                    applySnapshot(self.products.items, response.results);
                    (self as IDatasetProductSearchViz).dataset.searchParams.paging.setTotal(response.total);
                    self.setLoadingState(LoadingState.Success);
                    pendingSearchRequest = undefined;
                }, (error: any) => {
                    if (!error || error.statusText !== 'Canceled') {
                        self.setLoadingState(LoadingState.Error);
                        pendingSearchRequest = undefined;
                    }
                });
            }
        };
    }).actions((self) => ({
        afterAttach: () => {
            let productUpdaterDisposer = datasetProductResultsUpdater(self as IDatasetProductSearchViz);

            self.mapLayer = self.config.mapLayerFactory
                ? self.config.mapLayerFactory(self)
                : createGeometrySearchResultsLayer({
                    productSearchViz: self as IDatasetProductSearchViz
                });

            addDisposer(self, productUpdaterDisposer);
        }
    }))
);

export type IDatasetProductSearchViz = Instance<typeof DatasetProductSearchViz>;