import { types, Instance } from 'mobx-state-tree';

const MapProjectionDecl = types.model('MapProjection', {
    code: types.string,
    projDef: types.maybe(types.string),
    extent: types.maybe(types.array(types.number)),
    wrapX: types.optional(types.boolean, false)
});

type MapProjectionType = typeof MapProjectionDecl;
export interface MapProjectionInterface extends MapProjectionType {}
export const MapProjection: MapProjectionInterface = MapProjectionDecl;
export interface IMapProjection extends Instance<MapProjectionInterface> {}
