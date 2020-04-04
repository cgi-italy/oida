import { types, Instance, SnapshotIn } from 'mobx-state-tree';

import { IVerticalProfile, IVerticalProfileStyle } from '@oida/core';
import { Entity, createEntityCollectionType } from '@oida/state-mst';

const DatasetVerticalProfileDecl = Entity.addModel(
    types.model('DatasetVerticalProfile', {
        geometry: types.frozen<IVerticalProfile>(),
        style: types.frozen<Omit<IVerticalProfileStyle, 'visible'>>()
    }).actions((self) => {
        return {
            setGeometry: (geometry) => {
                self.geometry = geometry;
            },
            setStyle: (style) => {
                self.style = style;
            }
        };
    })
);


type DatasetVerticalProfileType = typeof DatasetVerticalProfileDecl;
export interface DatasetVerticalProfileInterface extends DatasetVerticalProfileType {}
export const DatasetVerticalProfile: DatasetVerticalProfileInterface = DatasetVerticalProfileDecl;
export interface IDatasetVerticalProfile extends Instance<DatasetVerticalProfileInterface> {}
export type VerticalProfileItem = SnapshotIn<DatasetVerticalProfileInterface>;


const DatasetVerticalProfilesDecl = createEntityCollectionType(DatasetVerticalProfile);

type DatasetVerticalProfilesType = typeof DatasetVerticalProfilesDecl;
export interface DatasetVerticalProfilesInterface extends DatasetVerticalProfilesType {}
export const DatasetVerticalProfiles: DatasetVerticalProfilesInterface = DatasetVerticalProfilesDecl;
export interface IDatasetVerticalProfiles extends Instance<DatasetVerticalProfilesInterface> {}
