import {
    types,
    IType, IModelType, ISimpleType, IOptionalIType, IAnyType, _NotCustomized,
    ModelProperties, ModelPropertiesDeclarationToProperties
 } from 'mobx-state-tree';

export const TaggedUnion =
    <TAG_KEY extends string, PROPS extends ModelProperties, OTHERS>
    (tagKey: TAG_KEY, BaseModel: IModelType<PROPS, OTHERS>) => {

    const REGISTERED_TYPES: Array<IType<any, any, any>> = [];

    const methods = {
        addModel: <SUB_PROPS extends ModelProperties, SUB_OTHERS>(model: IModelType<SUB_PROPS, SUB_OTHERS>) => {

            if (!model.name || model.name === 'AnonymousModel') {
                throw new Error('Registration of anonymous model is not allowed');
            }

            let keyValue = types.optional(types.literal(model.name), model.name);

            let keyTypeProp = {
                [tagKey]: keyValue
            } as {
                [K in TAG_KEY]: typeof keyValue
            };

            let specificType = types.compose(
                model.name,
                BaseModel,
                model.props(keyTypeProp)
            );

            REGISTERED_TYPES.push(specificType);

            return specificType;
        },
        addUnion: <SUB_TAG_KEY extends string, SUB_PROPS extends ModelProperties, SUB_OTHERS>
        (subTagKey: SUB_TAG_KEY, SubBaseModel: IModelType<SUB_PROPS, SUB_OTHERS>) => {
            let keyValue = types.optional(types.literal(SubBaseModel.name), SubBaseModel.name);

            let keyTypeProp = {
                [tagKey]: keyValue
            } as {
                [K in TAG_KEY]: typeof keyValue
            };

            let union = TaggedUnion(subTagKey, types.compose(
                SubBaseModel.name,
                BaseModel,
                SubBaseModel.props(keyTypeProp)
            ));

            REGISTERED_TYPES.push(union.Type);

            return union;
        },
        getSpecificType: (name: string) => {
            return REGISTERED_TYPES.find((type) => {
                return type.name === name;
            });
        }
    };

    type BaseProp = PROPS & ModelPropertiesDeclarationToProperties<{ [K in TAG_KEY]: IOptionalIType<ISimpleType<string>, any>; }>;

    let UnionType = types.late(() => {
        UnionType.name = `${BaseModel.name}: Union(${REGISTERED_TYPES.map(type => type.name).join()})`;
        return types.union(...REGISTERED_TYPES);
    }) as IModelType<BaseProp, OTHERS>;

    UnionType.name = BaseModel.name;

    return {
        Type: UnionType,
        ...methods
    };

};

