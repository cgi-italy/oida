import { types, Instance, IAnyModelType } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';

import { TaggedUnion, MapLayerType, isActivable } from '@oida/state-mst';

import { hasSharedAoi } from './has-shared-aoi';
import { Dataset } from './dataset';


const DatasetVizBase = types.compose(
    types.model({
        id: types.optional(types.identifier, () => uuid()),
        name: types.maybe(types.string),
        dataset: types.reference(Dataset),
        mapLayer: types.maybe(MapLayerType),
        parent: types.maybe(types.reference(types.late((): IAnyModelType => DatasetVizType as IAnyModelType))),
    }),
    hasSharedAoi,
    isActivable
);

export const DatasetViz = TaggedUnion('datasetVizType', DatasetVizBase);

type DatasetVizType = typeof DatasetViz.Type;
export interface DatasetVizInterface extends DatasetVizType { }
export const DatasetVizType: DatasetVizInterface = DatasetViz.Type;
export interface IDatasetViz extends Instance<DatasetVizInterface> { }
