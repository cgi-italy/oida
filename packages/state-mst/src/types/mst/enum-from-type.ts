import { types } from 'mobx-state-tree';


export const enumFromType = <EnumType extends string>(enumType) => {
    return types.enumeration<EnumType>(Object.keys(enumType).map(key => enumType[key]));
};
