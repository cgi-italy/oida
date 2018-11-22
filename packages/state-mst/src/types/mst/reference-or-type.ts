import { types, IAnyModelType } from 'mobx-state-tree';

export const ReferenceOrType = <T extends IAnyModelType>(Type: T) => {
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

