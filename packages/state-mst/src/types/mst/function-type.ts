import { types, TypeOrStateTreeNodeToStateTreeNode } from 'mobx-state-tree';

const registeredFunctions: {[s: string]: Function}  = {};
let nextFuncId = 1;

const funcIdKey = '__mst_func_id__';

export const registerFunction = (func: Function, id?: string) => {
    if (func[funcIdKey]) {
        return;
    }
    let funcId = id || (func.name !== 'anonymous' ? func.name : `func${nextFuncId++}`);
    while (registeredFunctions[funcId]) {
        funcId += '.1';
    }
    registeredFunctions[funcId] = func;

    Object.defineProperty(func, funcIdKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: funcId
    });
};

export const FunctionType = types.custom<string, Function>({
    name: 'Function',
    fromSnapshot(value) {
        return registeredFunctions[value];
    },
    toSnapshot(value) {
        if (!value[funcIdKey]) {
            registerFunction(value);
        }
        return value[funcIdKey];
    },
    isTargetType(value) {
        return typeof(value) === 'function';
    },
    getValidationMessage(snapshot) {
        if (typeof snapshot !== 'string' || !registeredFunctions[snapshot]) {
            return `No function with id  ${snapshot} found`;
        } else {
            return '';
        }
    }
});

