import { types } from 'mobx-state-tree';

export const ReferenceOrType = (Type) => {
    return types.union(
        {
            dispatcher: (snapshot) => {
                if (typeof(snapshot) === 'string') {
                    return  types.reference(Type);
                } else {
                    return Type;
                }
            }
        },
        types.reference(Type),
        Type
    );
};

