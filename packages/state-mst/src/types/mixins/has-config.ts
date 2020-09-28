import { types } from 'mobx-state-tree';

import { NonSerializableType, unregisterObject } from '../mst';

export const hasConfig = <T>() => types.model('hasConfig', {
    config: NonSerializableType<T>()
});

export const hasConfigWithDefault = <T>(defaultConfig: T) => types.model('hasConfig', {
    config: types.optional(NonSerializableType<T>(), defaultConfig)
});

export const hasOptionalConfig = <T>() => types.model('hasOptionalConfig', {
    config: types.maybe(NonSerializableType<T>())
});

export const hasDynamicConfig = <T>() => types.model('hasDynamicConfig', {
    config: types.maybe(NonSerializableType<T>({
        shouldThrowOnMultipleRegistration: true
    })),
}).actions((self) => {
    return {
        updateConfig: (props: Partial<T>) => {
            if (self.config) {
                unregisterObject(self.config);
            }

            // @ts-ignore
            self.config = {
                ...self.config,
                ...props
            } as T;
        }
    };
});
