import { types } from 'mobx-state-tree';

export const DynamicUnion = (typeId, baseTypeFactory) => {

    const REGISTERED_TYPES = [];
    let UnionType = null;

    return {
        addType: (id, model) => {

            let specificType = baseTypeFactory(
                model.props({
                    [`${typeId}Type`]: types.optional(types.literal(id), id)
                })
            );

            REGISTERED_TYPES.push(specificType);

            return specificType;
        },
        getType: (id) => {
            return REGISTERED_TYPES.filter((type) => {
                return type.properties[`${typeId}Type`].defaultValue === id;
            });
        },
        getUnion: () => {
            if (!UnionType) {
                UnionType =  types.late(() => {
                    UnionType.name = `${typeId}: Union(${REGISTERED_TYPES.map(type => type.name).join()})`;
                    return types.union(...REGISTERED_TYPES);
                });
                UnionType.name = typeId;
            }
            return UnionType;
        }
    };
};
