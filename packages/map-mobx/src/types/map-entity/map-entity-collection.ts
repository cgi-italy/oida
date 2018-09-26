import { types } from 'mobx-state-tree';

import { DynamicUnion } from '../mobx/dynamic-union';
import { Collection } from '../core';

const MapCollections = DynamicUnion('mapEntityCollection', (collection) => {
    return types.compose(
        collection.name,
        types.model({
            collectionId: types.identifier
        }),
        collection
    );
});

export const MapEntityCollection = (id?: string, mapEntityType?) => {

    if (!id) {
        return MapCollections.getUnion();
    } else {
        if (mapEntityType) {
            return MapCollections.addType(id, Collection(mapEntityType));
        } else {
            return MapCollections.getType(id);
        }
    }
};
