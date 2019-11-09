import { types, Instance } from 'mobx-state-tree';

import { TaggedUnion, MapLayer, isActivable } from '@oida/state-mst';

import { Dataset } from './dataset';

export const DatasetVizBase = types.compose(
    types.model({
        dataset: types.reference(Dataset)
    }),
    isActivable
);

export const DatasetViz = TaggedUnion('datasetVizType', DatasetVizBase);

export interface IDatasetViz extends Instance<typeof DatasetViz.Type> {}


export const DatasetMapVizBase = types.model({
    mapLayer: MapLayer.Type,
});

export const DatasetMapViz = DatasetViz.addUnion('datasetMapVizType', DatasetMapVizBase);

export interface IDatasetMapViz extends Instance<typeof DatasetMapViz.Type> {}
