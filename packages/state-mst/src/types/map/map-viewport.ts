import { types, Instance } from 'mobx-state-tree';

export const MapViewportDecl = types
    .model('MapViewport', {
        center: types.array(types.number),
        resolution: types.number,
        rotation: types.optional(types.number, 0),
        pitch: types.optional(types.number, 0)
    }).actions((self) => {
        return {
            setCenter(center) {
                self.center = center;
            },
            setResolution(resolution: number) {
                self.resolution = resolution;
            },
            setRotation(rotation: number) {
                self.rotation = rotation;
            },
            setPitch(pitch: number) {
                self.pitch = pitch;
            }
        };
    });


type MapViewportType = typeof MapViewportDecl;
export interface MapViewportInterface extends MapViewportType {}
export const MapViewport: MapViewportInterface = MapViewportDecl;
export interface IMapViewport extends Instance<MapViewportInterface> {}

