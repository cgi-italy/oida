import { types } from 'mobx-state-tree';

const registeredObjects: {[s: string]: any}  = {};
let nextObjId = 1;

const objIdKey = '__mst_object_id__';

const generateObjectKey = () => {
    return `mst_obj_${nextObjId++}`;
};

export const registerObject = <T>(obj: T, shouldThrowOnMultipleRegistration?: boolean) => {
    //already registered
    if (obj[objIdKey]) {
        if (shouldThrowOnMultipleRegistration) {
            throw new Error('NonSerializableType: object registered multiple times');
        }
        return;
    }
    let objId = generateObjectKey();

    registeredObjects[objId] = obj;

    Object.defineProperty(obj, objIdKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: objId
    });
};

export const unregisterObject = <T>(obj: T) => {
    if (obj && obj[objIdKey]) {
        delete registeredObjects[obj[objIdKey]];
    }
};

export type NonSerializableTypeOptions = {
    shouldThrowOnMultipleRegistration?: boolean
};

export const NonSerializableType = <T>(options?: NonSerializableTypeOptions) => {

    return types.custom<string, T>({
        name: 'NonSerializableObject',
        fromSnapshot(value) {
            return registeredObjects[value];
        },
        toSnapshot(value) {
            if (!value[objIdKey]) {
                registerObject(value, options?.shouldThrowOnMultipleRegistration);
            }
            return value[objIdKey];
        },
        isTargetType(value) {
            return !!value && typeof(value) !== 'string';
        },
        getValidationMessage(snapshot) {
            if (typeof snapshot !== 'string' || !registeredObjects[snapshot]) {
                return `No object with id  ${snapshot} found`;
            } else {
                return '';
            }
        }
    });
};

