import { types, SnapshotIn, Instance } from 'mobx-state-tree';
import { MapProjection } from './map-projection';
import { MapViewport } from './map-viewport';

export const MapView = types
    .model('MapView', {
        projection: types.optional(MapProjection, {code: 'EPSG:4326'}),
        viewport: MapViewport,
        updating: types.optional(types.boolean, false),
        animateOnChange: types.optional(types.boolean, true)
    }).actions(self => {
        return {
            setProjection(projection: SnapshotIn<typeof MapProjection>) {
                self.projection = MapProjection.create(projection);
            },
            setViewport(viewport: SnapshotIn<typeof MapViewport>) {
                self.viewport = MapViewport.create(viewport);
            },
            setUpdating(updating: boolean) {
                self.updating = updating;
            },
            setAnimateOnChange(animate: boolean) {
                self.animateOnChange = animate;
            }
        };
    }).extend((self) => {

        let currentTarget: HTMLElement;

        return {
            actions: {
                setCurrentTarget: (target: HTMLElement) => {
                    currentTarget = target;
                }
            },
            views: {
                get size() {
                    return currentTarget ? [currentTarget.clientWidth, currentTarget.clientHeight] : null;
                }
            }
        };
    });

export type IMapView = Instance<typeof MapView>;
