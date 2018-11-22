import { types, IAnyModelType } from 'mobx-state-tree';

import { DynamicUnion } from '../mst/dynamic-union';
import { Collection } from '../core';

const BaseMetadata = types.model({
    collectionId: types.identifier
});

const MapEntityCollections = DynamicUnion<'mapEntityCollectionType', typeof BaseMetadata>(
    'mapEntityCollectionType',
    (collection) => {
        return types.compose(
            collection.name,
            BaseMetadata,
            collection
        );
    }
);

export const createMapEntityCollectionType = <T extends IAnyModelType>(type: T) => {
    return MapEntityCollections.addType(`${type.name}Collection`, Collection(type));
};

export const getMapEntityCollectionType = (id?: string) => {
    if (id) {
        return MapEntityCollections.getType(id);
    } else {
        return MapEntityCollections.getUnion();
    }
};
