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
                .named(id)
            );

            REGISTERED_TYPES.push(specificType);

            return specificType;
        },
        getUnion: () => {
            if (!UnionType) {
                UnionType =  types.late(() => types.union(...REGISTERED_TYPES));
            }
            return UnionType;
        }
    };
};
