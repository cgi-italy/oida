export interface IDynamicFactory<T> {
    register: (id: string, objectCreator: (...args: Array<any>) => T) => void;
    create: (id: string, ...args: Array<any>) => T | undefined;
    isRegistered: (id: string) => boolean;
}

export const createDynamicFactory = <T = any>(factoryId: string): IDynamicFactory<T> => {
    const REGISTERED_TYPES: {[s: string]: (...args: Array<any>) => T} = {};

    const getRegisteredType = (id: string) => {
        return REGISTERED_TYPES[id];
    };

    return {
        register: (id: string, objectCreator: (...args: Array<any>) => T) => {
            if (getRegisteredType(id)) {
                throw new Error(`Dynamic factory ${factoryId}: factory already registered for type ${id}`);
            }
            REGISTERED_TYPES[id] = objectCreator;
        },
        create: (id: string, ...args: Array<any>) : T | undefined => {
            let objectCreator = getRegisteredType(id);
            if (objectCreator) {
                return objectCreator.apply(null, args);
            }
        },
        isRegistered: (id: string): boolean => {
            return getRegisteredType(id) !== undefined;
        }
    };
};

