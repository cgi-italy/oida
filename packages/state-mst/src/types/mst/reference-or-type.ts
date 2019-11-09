import { types, IAnyModelType, IReferenceType, IMaybe, isStateTreeNode, hasParent } from 'mobx-state-tree';

export function ReferenceOrType<T extends IAnyModelType>(
    Type: T,
    referenceType?: undefined
): T | IReferenceType<T>;
export function ReferenceOrType<T extends IAnyModelType>(
    Type: T,
    referenceType?: IReferenceType<T>
): T | IReferenceType<T>;
export function ReferenceOrType<T extends IAnyModelType>(
    Type: T,
    referenceType?: IMaybe<IReferenceType<T>>
): T | IMaybe<IReferenceType<T>>;
export function ReferenceOrType<T extends IAnyModelType>(Type: T, referenceType?: IReferenceType<T> | IMaybe<IReferenceType<T>>) {

    if (!referenceType) {
        referenceType =  types.reference(Type);
    }

    let refType = referenceType || types.reference(Type);
    return types.union(
        {
            dispatcher: (snapshotOrInstance) => {
                if (!snapshotOrInstance) {
                    return refType;
                }
                if (typeof(snapshotOrInstance) === 'string') {
                    return refType;
                }
                if (isStateTreeNode(snapshotOrInstance) && hasParent(snapshotOrInstance)) {
                    return refType;
                }
                return Type;
            }
        },
        referenceType,
        Type
    ) as T | typeof refType;
}

