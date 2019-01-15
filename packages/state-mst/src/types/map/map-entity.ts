import { types, Instance, getType } from 'mobx-state-tree';

import { DynamicUnion } from '../mst/dynamic-union';
import { hasVisibility, isSelectable, isHoverable } from '../mixins';


const identifierCache = new Map<string, Map<string, IMapEntity>>();

const MapEntityBase = types.compose(
    types.model({
        id: types.string
    }),
    hasVisibility,
    isSelectable,
    isHoverable
).actions((self) => {
    return {
        afterCreate: () => {
            identifierCache.get(getType(self).name).set(self.id, self as IMapEntity);
        },
        beforeDestroy: () => {
            identifierCache.get(getType(self).name).delete(self.id);
        }
    };
});


export const MapEntityType = DynamicUnion<'mapEntityType', typeof MapEntityBase>
    ('mapEntityType', (entityModel) => {

    if (entityModel.name === 'AnonymousModel') {
        throw new Error('Anonymouse map entity type not allowed');
    }
    if (identifierCache.has(entityModel.name)) {
        throw new Error(`MapEntity ${entityModel.name} already registered`);
    }

    identifierCache.set(entityModel.name, new Map());

    return types.compose(
        entityModel.name,
        MapEntityBase,
        entityModel
    );
});

export function createMapEntityReference<T extends IMapEntity>(mapEntity: T) {
    return `${getType(mapEntity).name}.${mapEntity.id}`;
}

export const resolveMapEntityReference = (reference: string) => {
    let [entityType, entityId] = reference.split('.');
    return identifierCache.get(entityType).get(entityId);
};

export const MapEntityReference = types.safeReference(MapEntityType.getUnion(), {
    get(mapEntityId: string, parent) {
        return resolveMapEntityReference(mapEntityId);
    },
    set(mapEntity: IMapEntity, parent) {
        return createMapEntityReference(mapEntity);
    }
});


export type IMapEntity = Instance<typeof MapEntityBase>;
