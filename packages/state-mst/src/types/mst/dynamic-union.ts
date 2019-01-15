import { types, IModelType, ModelProperties, IAnyModelType, Instance } from 'mobx-state-tree';

declare type ExtractProps<T extends IAnyModelType> = T extends IModelType<infer P, any, any, any> ? P : never;
declare type ExtractOthers<T extends IAnyModelType> = T extends IModelType<any, infer O, any, any> ? O : never;


export const DynamicUnion = <TYPE_KEY extends string, BASE extends IAnyModelType>

    (
        typeKey: TYPE_KEY,
        baseTypeFactory: <PROPS extends ModelProperties, OTHERS>
            (model: IModelType<PROPS, OTHERS>) => IModelType<ExtractProps<BASE> & PROPS, ExtractOthers<BASE> & OTHERS>
    ) => {

    const REGISTERED_TYPES = [];
    let UnionType: ReturnType<typeof baseTypeFactory> = null;

    return {
        addType: <PROPS extends ModelProperties, OTHERS>(id: string, model: IModelType<PROPS, OTHERS>) => {

            let keyValue = types.optional(types.literal(id), id);

            let keyTypeProp = {
                [typeKey]: keyValue
            } as {
                [K in TYPE_KEY]: typeof keyValue
            };

            let specificType = baseTypeFactory(
                model.props(keyTypeProp)
            );

            REGISTERED_TYPES.push(specificType);

            return specificType;
        },
        getType: (id: string) => {
            let matchingTypes = REGISTERED_TYPES.filter((type) => {
                return type.properties[typeKey].defaultValue === id;
            });
            if (matchingTypes.length === 1) {
                return matchingTypes[0];
            } else {
                return types.union(...matchingTypes);
            }
        },
        getUnion: () => {
            if (!UnionType) {
                UnionType = types.late(() => {
                    UnionType.name = `${typeKey}: Union(${REGISTERED_TYPES.map(type => type.name).join()})`;
                    return types.union(...REGISTERED_TYPES);
                }) as BASE;
                UnionType.name = typeKey;
            }
            return UnionType;
        }
    };
};
