import { types } from 'mobx-state-tree';

import { NonSerializableType } from '../mst';

export const hasConfig = <T>() => types.model('hasConfig', {
    config: NonSerializableType<T>()
});

export const hasOptionalConfig = <T>() => types.model('hasOptionalConfig', {
    config: types.maybe(NonSerializableType<T>())
});
