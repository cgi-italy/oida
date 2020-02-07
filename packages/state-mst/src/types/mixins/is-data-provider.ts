import { reaction } from 'mobx';
import { types, Instance, flow } from 'mobx-state-tree';
import debounce from 'lodash/debounce';

import { LoadingState, CancelablePromise } from '@oida/core';
import { hasLoadingState } from './has-loading-state';


export const isDataProvider = types.compose(
    'isDataProvider',
    hasLoadingState,
    types.model({
        debounceInterval: types.maybe(types.number)
    })
    .volatile((self) => ({
        pendingDataRequest: undefined as CancelablePromise<any> | undefined
    }))
).actions((self) => {

    let invokeDataRequest = (self as any).startDataRequest;

    return {
        startDataRequest: flow(function*<T>(request: () => CancelablePromise<T>) {
            if (self.pendingDataRequest) {
                self.pendingDataRequest.cancel();
                self.pendingDataRequest = undefined;
            }

            self.setLoadingState(LoadingState.Loading);
            self.pendingDataRequest = request();

            try {
                let response: T = yield self.pendingDataRequest;
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

        }),
        retrieveData: <T>(request: () => CancelablePromise<T>) => {
            return invokeDataRequest(request) as CancelablePromise<T>;
        },
        cancelDataRequest: () => {
            if (self.pendingDataRequest) {
                self.pendingDataRequest.cancel();
                self.pendingDataRequest = undefined;
            }
        },
        afterAttach: () => {
            reaction(() => self.debounceInterval, (debounceInterval) => {
                if (debounceInterval) {
                    invokeDataRequest = debounce((self as any).startDataRequest, debounceInterval);
                } else {
                    invokeDataRequest = (self as any).startDataRequest;
                }
            }, {fireImmediately: true});
        }
    };
});
