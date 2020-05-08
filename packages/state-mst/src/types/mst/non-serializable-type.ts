import { types } from 'mobx-state-tree';

const registeredObjects: {[s: string]: any}  = {};
let nextObjId = 1;

const objIdKey = '__mst_object_id__';

const generateObjectKey = () => {
    return `mst_obj_${nextObjId++}`;
};

export const registerObject = <T>(obj: T, id?: string) => {
    //already registered
    if (obj[objIdKey]) {
        return;
    }
    let objId = id || generateObjectKey();

    registeredObjects[objId] = obj;

    Object.defineProperty(obj, objIdKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: objId
    });
};

export type NonSerializableTypeOptions = {
    fixedKey?: string | boolean
};

export const NonSerializableType = <T>(options?: NonSerializableTypeOptions) => {

    let fixedKey: string | undefined = undefined;

    if (options) {
        if (typeof(options.fixedKey) === 'boolean') {
            if (options.fixedKey === true) {
                fixedKey = generateObjectKey();
            }
        } else {
            fixedKey = options.fixedKey;
        }
    }

    return types.custom<string, T>({
        name: 'NonSerializableObject',
        fromSnapshot(value) {
            return registeredObjects[value];
        },
        toSnapshot(value) {
            if (!value[objIdKey]) {
                registerObject(value, fixedKey);
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

