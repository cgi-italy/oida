import { types, Instance, SnapshotOrInstance, cast, applyPatch, resolveIdentifier, isAlive } from 'mobx-state-tree';

import { Geometry } from '@oida/core';
import { ReferenceOrType } from '@oida/state-mst';

let nextAoiId = 1;

const ReferenceableAoiDecl = types.model('ReferenceableAoi', {
    id: types.optional(types.identifier, () => `${nextAoiId++}`),
    geometry: types.frozen<Geometry>(),
    hoveredPosition: types.maybe(types.frozen<GeoJSON.Position>())
}).actions((self) => {
    return {
        setGeometry: (geometry: Geometry) => {
            self.geometry = geometry;
        },
        setHoveredPosition: (position: GeoJSON.Position | undefined) => {
            self.hoveredPosition = position;
        }
    };
}).views((self) => {
    return {
        get name() {
            return `${self.geometry.type} ${self.id}`;
        }
    };
});

type ReferenceableAoiType = typeof ReferenceableAoiDecl;
export interface ReferenceableAoiInterface extends ReferenceableAoiType { }
export const ReferenceableAoi: ReferenceableAoiInterface = ReferenceableAoiDecl;
export interface IReferenceableAoi extends Instance<ReferenceableAoiInterface> { }

export const ReferenceableAoiReference = types.reference(ReferenceableAoi, {
    onInvalidated: (evt) => {
        evt.parent.setAoi(undefined);
        const invalidTarget = evt.invalidTarget;
        if (invalidTarget) {
            let { id, geometry } = invalidTarget;
            setTimeout(() => {
                if (!isAlive(evt.parent)) {
                    return;
                }
                let aoi = resolveIdentifier(ReferenceableAoi, evt.parent, id);
                if (aoi) {
                    applyPatch(evt.parent, {
                        op: 'replace',
                        path: '/aoi',
                        value: id
                    });
                } else {
                    evt.parent.setAoi({
                        id: id,
                        geometry: geometry
                    });
                }
            }, 0);
        }
    }
});

export const hasSharedAoi = types.model('hasSharedAoi', {
    aoi: types.maybe(ReferenceOrType(ReferenceableAoi, ReferenceableAoiReference))
}).actions((self) => {
    return {
        setAoi: (aoi: SnapshotOrInstance<ReferenceableAoiInterface> | undefined) => {
            if (self.aoi && aoi && !aoi.id) {
                self.aoi.setGeometry(aoi.geometry);
            } else {
                self.aoi = cast(aoi);
            }
        },
        unlinkAoi: () => {
            if (!!self.aoi) {
                self.aoi = cast({
                    geometry: self.aoi.geometry,
                });
            }
        },
        linkAoi: (aoiId: string) => {
            let aoi = resolveIdentifier(ReferenceableAoi, self, aoiId);
            if (aoi) {
                applyPatch(self, {
                    op: 'replace',
                    path: '/aoi',
                    value: aoiId
                });
            }
        }
    };
});
