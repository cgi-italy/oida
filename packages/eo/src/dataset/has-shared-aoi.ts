import { types, Instance, SnapshotOrInstance, cast, castToSnapshot, applySnapshot, getSnapshot } from 'mobx-state-tree';
import { v4 as uuid } from 'uuid';

import { Geometry } from '@oida/core';
import { TaggedUnion, MapLayerType, ReferenceOrType, isActivable } from '@oida/state-mst';


const ReferenceableAoiDecl = types.model('ReferenceableAoi', {
    id: types.optional(types.identifier, () => uuid()),
    geometry: types.frozen<Geometry>()
}).actions((self) => {
    return {
        setGeometry: (geometry: Geometry) => {
            self.geometry = geometry;
        }
    };
});

type ReferenceableAoiType = typeof ReferenceableAoiDecl;
export interface ReferenceableAoiInterface extends ReferenceableAoiType { }
export const ReferenceableAoi: ReferenceableAoiInterface = ReferenceableAoiDecl;
export interface IReferenceableAoi extends Instance<ReferenceableAoiInterface> { }


export const hasSharedAoi = types.model('hasSharedAoi', {
    aoi: types.maybe(ReferenceOrType(ReferenceableAoi, types.safeReference(ReferenceableAoi)))
}).actions((self) => {
    return {
        setAoi: (aoi: SnapshotOrInstance<ReferenceableAoiInterface> | undefined) => {
            if (self.aoi && aoi && !aoi.id) {
                self.aoi.setGeometry(aoi.geometry);
            } else {
                self.aoi = cast(aoi);
            }
        }
    };
});
