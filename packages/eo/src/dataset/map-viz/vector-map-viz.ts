import { autorun } from 'mobx';
import { types, addDisposer, Instance, SnapshotIn, applySnapshot } from 'mobx-state-tree';

import { LoadingState, Geometry } from '@oida/core';
import { hasConfig, FeatureLayer, Entity, createEntityCollectionType, EntityStyleGetter } from '@oida/state-mst';

import { DatasetViz } from '../dataset-viz';

export const VECTOR_VIZ_TYPE = 'vector';

const DatasetVectorFeatureDecl = Entity.addModel(
    types.model('DatasetVectoreFeature', {
        geometry: types.frozen<Geometry>(),
        properties: types.frozen()
    })
);

type DatasetVectorFeatureType = typeof DatasetVectorFeatureDecl;
export interface DatasetVectorFeatureInterface extends DatasetVectorFeatureType {}
export const DatasetVectorFeature: DatasetVectorFeatureInterface = DatasetVectorFeatureDecl;
export interface IDatasetVectorFeature extends Instance<DatasetVectorFeatureInterface> {}
export type VectorFeature = SnapshotIn<DatasetVectorFeatureInterface>;

const DatasetVectorFeatureCollectionDecl = createEntityCollectionType(DatasetVectorFeature);
type DatasetVectorFeatureCollectionType = typeof DatasetVectorFeatureCollectionDecl;
export interface DatasetVectorFeatureCollectionInterface extends DatasetVectorFeatureCollectionType {}
export const DatasetVectorFeatureCollection: DatasetVectorFeatureCollectionInterface = DatasetVectorFeatureCollectionDecl;
export interface IDatasetVectorCollectionFeature extends Instance<DatasetVectorFeatureCollectionInterface> {}

export interface VectorDataProvider {
    getFeatures: (vectorViz) => Promise<VectorFeature[]>;
}

export type VectorVizConfig = {
    dataProvider: VectorDataProvider;
    styleGetter: EntityStyleGetter<IDatasetVectorFeature>;
    contentGetter: (feature: IDatasetVectorFeature) => any,
    infoTemplate: (feature: IDatasetVectorFeature) => any,
    afterInit?: (vectorViz) => void;
};

const DatasetVectorVizDecl = DatasetViz.addModel(
    types.compose(
        VECTOR_VIZ_TYPE,
        types.model({
            mapLayer: types.maybe(FeatureLayer),
            data: types.optional(DatasetVectorFeatureCollection, {})
        }),
        hasConfig<VectorVizConfig>()
    ).actions((self) => {

        const refreshData = () => {
            const mapLayer = self.mapLayer!;
            mapLayer.setLoadingState(LoadingState.Loading);

            self.config.dataProvider.getFeatures(self).then(features => {
                applySnapshot(self.data.items, features);
                mapLayer.setLoadingState(LoadingState.Success);
            }).catch((error) => {
                self.data.clear();
                mapLayer.setLoadingProps({
                    state: LoadingState.Error,
                    message: error
                });
            });
        };

        return {
            refreshData: refreshData,
            afterAttach: () => {

                const mapLayer = FeatureLayer.create({
                    id: `${(self as IDatasetVectorViz).dataset.id}vectorView`,
                    source: self.data.id,
                    config: {
                        styleGetter: self.config.styleGetter,
                        rendererOptions: {
                            cesium: {
                                entityMode: false
                            }
                        }
                    }
                });

                self.mapLayer = mapLayer;

                let visibilityUpdateDisposer = autorun(() => {
                    mapLayer.setVisible((self as IDatasetVectorViz).active);
                });

                let dataUpdaterDisposer = autorun(() => {
                    refreshData();
                });

                if (self.config.afterInit) {
                    self.config.afterInit(self);
                }

                addDisposer(self, dataUpdaterDisposer);
                addDisposer(self, visibilityUpdateDisposer);
            }
        };
    })
);

type DatasetVectorVizType = typeof DatasetVectorVizDecl;
export interface DatasetVectorVizInterface extends DatasetVectorVizType {}
export const DatasetVectorViz: DatasetVectorVizInterface = DatasetVectorVizDecl;
export interface IDatasetVectorViz extends Instance<DatasetVectorVizInterface> {}
