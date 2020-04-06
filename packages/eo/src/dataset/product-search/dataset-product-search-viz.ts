import { autorun } from 'mobx';
import { types, Instance, addDisposer, applySnapshot, onSnapshot } from 'mobx-state-tree';
import debounce from 'lodash/debounce';

import { LoadingState, CancelablePromise } from '@oida/core';

import { hasLoadingState, hasConfig } from '@oida/state-mst';

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


export const DatasetProductSearchVizDecl = DatasetViz.addModel(
    types.compose(
        'DatasetProductSearchViz',
        types.model({
            products: types.optional(DatasetProducts, {})
        }),
        hasLoadingState,
        hasConfig<DatasetProductSearchConfig>()
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

            (self as IDatasetProductSearchViz).mapLayer = self.config.mapLayerFactory
                ? self.config.mapLayerFactory(self)
                : createGeometrySearchResultsLayer({
                    productSearchViz: self as IDatasetProductSearchViz
                });

            addDisposer(self, productUpdaterDisposer);
        }
    }))
);

type DatasetProductSearchVizType = typeof DatasetProductSearchVizDecl;
export interface DatasetProductSearchVizInterface extends DatasetProductSearchVizType {}
export const DatasetProductSearchViz: DatasetProductSearchVizInterface = DatasetProductSearchVizDecl;
export interface IDatasetProductSearchViz extends Instance<DatasetProductSearchVizInterface> {}

