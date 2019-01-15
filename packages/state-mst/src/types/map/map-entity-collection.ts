import { types, IAnyModelType, Instance } from 'mobx-state-tree';

import { DynamicUnion } from '../mst/dynamic-union';
import { MapEntityType } from './map-entity';

import { Collection, IndexedCollection } from '../core';

const BaseMetadata = types.model({
    collectionId: types.identifier
});

const MapEntityCollections = DynamicUnion<'mapEntityCollectionType', typeof BaseMetadata>('mapEntityCollectionType',
    (collection) => {
        return types.compose(
            collection.name,
            BaseMetadata,
            collection
        );
    }
);

type IMapEntityType = ReturnType<typeof MapEntityType.getUnion>;

export function MapEntityCollectionFactory<T extends IMapEntityType>(entityType: T) {
    return IndexedCollection(Collection(entityType), (id, collection) => {
        return collection.items.find((item) => {
            return item.id === id;
        });
    });
}

export const createMapEntityCollectionType = <T extends IAnyModelType>(type: T, collectionFactory = MapEntityCollectionFactory) => {
    return MapEntityCollections.addType(`${type.name}Collection`, collectionFactory(type));
};

export const getMapEntityCollectionType = () => {
    return MapEntityCollections.getUnion() as typeof BaseMetadata & ReturnType<typeof IndexedCollection> ;
};

export type IMapEntityCollection = Instance<ReturnType<typeof createMapEntityCollectionType>>;
