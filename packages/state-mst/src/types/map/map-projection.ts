import { types } from 'mobx-state-tree';

export const MapProjection = types
    .model('MapProjection', {
        code: types.string,
        projDef: types.maybe(types.string),
        extent: types.maybe(types.array(types.number)),
        wrapX: types.optional(types.boolean, false)
    });
