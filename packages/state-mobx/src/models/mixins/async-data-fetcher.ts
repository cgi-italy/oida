import debounce from 'lodash/debounce';

import { LoadingStatus, HasLoadingStatus } from './has-loading-status';
import { LoadingState, CancelablePromise } from '@oida/core';

export type AsyncDataFetcherProps<T> = {
    dataFetcher: () => Promise<T>;
    debounceInterval?: number;
};

export class AsyncDataFetcher<T> implements HasLoadingStatus {

    loadingStatus: LoadingStatus;

    protected debouncedRequest_;
    protected pendingDataRequest_: Promise<T> | undefined;
    protected dataFetcher_: () => Promise<T>;

    constructor(props: AsyncDataFetcherProps<T>) {

        this.loadingStatus = new LoadingStatus();
        this.dataFetcher_ = props.dataFetcher;
        this.setDebounceInterval(props.debounceInterval);
    }

    fetchData() {
        this.cancelPendingRequest();
        const debouncedRequest = this.debouncedRequest_;
        if (debouncedRequest) {
            return new Promise<T>((resolve, reject) => {
                return debouncedRequest(resolve, reject);
            });
        } else {
            return this.invokeFetchRequest_();
        }
    }

    setDebounceInterval(debounceInterval: number | undefined) {
        if (debounceInterval) {
            this.debouncedRequest_ = debounce((resolve: (value: T | undefined) => void, reject: (reason: any) => void) => {
                this.invokeFetchRequest_().then((response) => {
                    resolve(response);
                }, (error) => {
                    reject(error);
                });
            }, debounceInterval);
        } else {
            delete this.debouncedRequest_;
        }
    }

    cancelPendingRequest() {
        if (this.pendingDataRequest_) {
            if (this.pendingDataRequest_.cancel) {
                this.pendingDataRequest_.cancel();
            } else {
                this.pendingDataRequest_.isCanceled = true;
            }
        }
        this.pendingDataRequest_ = undefined;
    }

    protected invokeFetchRequest_() {
        this.loadingStatus.setValue(LoadingState.Loading);
        const dataRequest = this.dataFetcher_();

        const requestWrapper = CancelablePromise(new Promise<T>((resolve, reject) => {
            dataRequest.then((data) => {
                if (!requestWrapper.isCanceled) {
                    this.loadingStatus.setValue(LoadingState.Success);
                    resolve(data);
                }
            }, (error) => {
                if (!requestWrapper.isCanceled) {
                    this.loadingStatus.update({
                        value: LoadingState.Error,
                        message: error
                    });
                    reject(error);
                }
            }).finally(() => {
                if (requestWrapper === this.pendingDataRequest_) {
                    delete this.pendingDataRequest_;
                }
            });
        }), () => {
            if (dataRequest.cancel) {
                dataRequest.cancel();
            }
        });

        this.pendingDataRequest_ = requestWrapper;
        return requestWrapper;
    }
}
