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
    })
    .volatile(() => ({
        target: undefined as (HTMLElement | undefined)
    }))
    .actions((self) => ({
        setDomTarget: (target: HTMLElement | undefined) => {
            self.target = target;
        }
    }))
    .views((self) => ({
        get size() {
            return self.target ? [self.target.clientWidth, self.target.clientHeight] : null;
        }
    }));

export type IMapView = Instance<typeof MapView>;
