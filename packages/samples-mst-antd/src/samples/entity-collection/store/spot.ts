import { types, Instance } from 'mobx-state-tree';

import { Entity, createEntityCollectionType } from '@oida/state-mst';

export const Spot = Entity.addModel(types.model('Spot', {
    name: types.string
}));

export const SpotCollection = createEntityCollectionType(Spot);

export type ISpot = Instance<typeof Spot>;
export type ISpotCollection = Instance<typeof SpotCollection>;
