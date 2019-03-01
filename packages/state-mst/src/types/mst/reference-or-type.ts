import { types, IAnyModelType, IReferenceType, IMaybe } from 'mobx-state-tree';

export const ReferenceOrType = <T extends IAnyModelType>(Type: T, referenceType?: IMaybe<IReferenceType<T>>) => {

    if (!referenceType) {
        referenceType =  types.maybe(types.reference(Type));
    }
    return types.union(
        {
            dispatcher: (snapshot) => {
                if (!snapshot || typeof(snapshot) === 'string') {
                    return referenceType;
                } else if (snapshot) {
                    return types.maybe(Type);
                }
            }
        },
        referenceType,
        types.maybe(Type)
    );
};

