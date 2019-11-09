import { types, Instance, flow } from 'mobx-state-tree';

import { LoadingState, CancelablePromise } from '@oida/core';
import { hasLoadingState } from '@oida/state-mst';

export const isDataProvider = types.compose(
    'hasDataProvider',
    hasLoadingState,
    types.model({
        debounce: types.maybe(types.number)
    })
    .volatile((self) => ({
        pendingDataRequest: undefined as CancelablePromise<any> | undefined
    }))
).actions((self) => ({
    startDataRequest: flow(function*<T>(request: CancelablePromise<T>) {
        if (self.pendingDataRequest) {
            self.pendingDataRequest.cancel();
            self.pendingDataRequest = undefined;
        }

        self.setLoadingState(LoadingState.Loading);
        self.pendingDataRequest = request;

        try {
            let response: T = yield request;
            self.setLoadingState(LoadingState.Success);
            self.pendingDataRequest = undefined;
            return response;
        } catch (error) {
            if (!error || error.statusText !== 'Canceled') {
                self.setLoadingState(LoadingState.Error);
                self.pendingDataRequest = undefined;
            }
            throw error;
        }

    })
}));
