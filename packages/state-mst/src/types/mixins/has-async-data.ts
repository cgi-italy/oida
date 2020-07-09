import { reaction } from 'mobx';
import { types, flow } from 'mobx-state-tree';
import debounce from 'lodash/debounce';

import { LoadingState } from '@oida/core';
import { hasLoadingState } from './has-loading-state';


export const hasAsyncData = types.compose(
    'hasAsyncData',
    hasLoadingState,
    types.model({
        debounceInterval: types.maybe(types.number)
    })
).actions((self) => {

    let pendingDataRequest: Promise<any> | undefined;

    const cancelPendingRequest = () => {
        if (pendingDataRequest) {
            if (pendingDataRequest.cancel) {
                pendingDataRequest.cancel();
            } else {
                pendingDataRequest.isCanceled = true;
            }
        }
        pendingDataRequest = undefined;
    };

    const startDataRequest = <T>(request: () => Promise<T>) => {
        cancelPendingRequest();

        self.setLoadingState(LoadingState.Loading);
        const newRequest = request();
        pendingDataRequest = newRequest;

        return newRequest.then((response) => {
            if (!newRequest.isCanceled) {
                self.setLoadingState(LoadingState.Success);
                return response;
            }
        }, (error) => {
            self.setLoadingState(LoadingState.Error);
            throw error;
        }).finally(() => {
            if (newRequest === pendingDataRequest) {
                pendingDataRequest = undefined;
            }
        });
    };

    let invokeDataRequest = startDataRequest;

    return {
        retrieveData: flow(function*<T>(request: () => Promise<T>) {
            const response = yield invokeDataRequest(request) as Promise<T>;
            return response;
        }),
        cancelDataRequest: cancelPendingRequest,
        setDebounceInterval: (interval: number | undefined) => {
            self.debounceInterval = interval;
        },
        afterAttach: () => {
            reaction(() => self.debounceInterval, (debounceInterval) => {
                if (debounceInterval) {
                    let debouncedRequest = debounce((request, resolve, reject) => {
                        startDataRequest(request).then((response) => {
                            resolve(response);
                        }, (error) => {
                            reject(error);
                        });
                    }, debounceInterval);
                    invokeDataRequest = (request) => {
                        return new Promise((resolve, reject) => {
                            debouncedRequest(request, resolve, reject);
                        });
                    };
                } else {
                    invokeDataRequest = startDataRequest;
                }
            }, {fireImmediately: true});
        }
    };
});
