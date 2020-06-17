import { types } from 'mobx-state-tree';

const registeredObjects: {[s: string]: any}  = {};
let nextObjId = 1;

const objIdKey = '__mst_object_id__';

const generateObjectKey = () => {
    return `mst_obj_${nextObjId++}`;
};

export const registerObject = <T>(obj: T) => {
    //already registered
    if (obj[objIdKey]) {
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


export const NonSerializableType = <T>() => {

    return types.custom<string, T>({
        name: 'NonSerializableObject',
        fromSnapshot(value) {
            return registeredObjects[value];
        },
        toSnapshot(value) {
            if (!value[objIdKey]) {
                registerObject(value);
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

