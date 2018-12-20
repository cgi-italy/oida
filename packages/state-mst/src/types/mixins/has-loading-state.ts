import { types } from 'mobx-state-tree';

import { LoadingState } from '@oida/core';

import { enumFromType } from '../mst';

export const hasLoadingState = types.model({
    loadingState: types.optional(enumFromType<LoadingState>(LoadingState), LoadingState.Init),
    message: types.maybe(types.string)
}).actions((self) => {
    return {
        setLoadingState: (loadingState: LoadingState, message?: string) => {
            self.loadingState = loadingState;
            self.message = message;
        }
    };
});
