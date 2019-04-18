import { types, IAnyType } from 'mobx-state-tree';

export const MaybeType = <T extends IAnyType> (type: T) => {
    return types.maybe(types.maybeNull(type));
};
