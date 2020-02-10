import { types, Instance } from 'mobx-state-tree';

import { TaggedUnion, MapLayerType, isActivable } from '@oida/state-mst';

import { Dataset } from './dataset';

const gerateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const DatasetVizBase = types.compose(
    types.model({
        dataset: types.reference(Dataset),
        id: types.optional(types.string, gerateRandomId)
    }),
    isActivable
);

export const DatasetViz = TaggedUnion('datasetVizType', DatasetVizBase);

type DatasetVizType = typeof DatasetViz.Type;
export interface DatasetVizInterface extends DatasetVizType {}
export const DatasetVizType: DatasetVizInterface = DatasetViz.Type;
export interface IDatasetViz extends Instance<DatasetVizInterface> {}

export const DatasetMapVizBase = types.model({
    mapLayer: MapLayerType,
});

export const DatasetMapViz = DatasetViz.addUnion('datasetMapVizType', DatasetMapVizBase);

type DatasetMapVizType = typeof DatasetMapViz.Type;
export interface DatasetMapVizInterface extends DatasetMapVizType {}
export const DatasetMapVizType: DatasetMapVizInterface = DatasetMapViz.Type;
export interface IDatasetMapViz extends Instance<DatasetMapVizInterface> {}
