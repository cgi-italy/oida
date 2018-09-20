import { types } from 'mobx-state-tree';

export const MapViewport = types
    .model('MapViewport', {
        center: types.array(types.number),
        resolution: types.number,
        rotation: types.optional(types.number, 0),
        pitch: types.optional(types.number, 0)
    });
