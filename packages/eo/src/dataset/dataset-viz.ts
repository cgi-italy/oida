import { types, Instance, IAnyModelType, getParentOfType } from 'mobx-state-tree';

import { TaggedUnion, MapLayerType, isActivable } from '@oida/state-mst';

import { Dataset } from './dataset';

const gerateRandomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const DatasetVizBase = types.compose(
    types.model({
        id: types.optional(types.identifier, gerateRandomId),
        name: types.maybe(types.string),
        dataset: types.reference(Dataset),
        mapLayer: types.maybe(MapLayerType),
        parent: types.maybe(types.reference(types.late((): IAnyModelType => DatasetVizBase))),
    }),
    isActivable
);

export const DatasetViz = TaggedUnion('datasetVizType', DatasetVizBase);

type DatasetVizType = typeof DatasetViz.Type;
export interface DatasetVizInterface extends DatasetVizType { }
export const DatasetVizType: DatasetVizInterface = DatasetViz.Type;
export interface IDatasetViz extends Instance<DatasetVizInterface> { }

