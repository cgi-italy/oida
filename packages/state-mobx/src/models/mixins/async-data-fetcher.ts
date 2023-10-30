import debounce from 'lodash/debounce';

import { LoadingStatus, HasLoadingStatus } from './has-loading-status';
import { LoadingState, CancelablePromise } from '@oidajs/core';

/** Constructor parameters for {@link AsyncDataFetcher} class */
export type AsyncDataFetcherProps<RESPONSE = any, PARAMS = any> = {
    /** The data retrieval function */
    dataFetcher: (params: PARAMS) => Promise<RESPONSE>;
    /** An optional debounce interval in milliseconds. */
    debounceInterval?: number;
};

type DebouncedRequestType<RESPONSE = any, PARAMS = any> = (
    params: PARAMS,
    resolve: (value: RESPONSE | PromiseLike<RESPONSE>) => void,
    reject: (reason: any) => void
) => void;

/**
 * A class to manage async data fetching logic with loading state tracking and optional debouncing.
 * @template RESPONSE the async response type
 * @template PARAMS the params input of the data fetch method
 */
export class AsyncDataFetcher<RESPONSE = any, PARAMS = any> implements HasLoadingStatus {
    /** The data fetching loading state */
    readonly loadingStatus: LoadingStatus;

    protected debouncedRequest_: DebouncedRequestType<RESPONSE, PARAMS> | undefined;
    protected pendingDataRequest_: Promise<RESPONSE> | undefined;
    protected dataFetcher_: (params: PARAMS) => Promise<RESPONSE>;

    constructor(props: AsyncDataFetcherProps<RESPONSE, PARAMS>) {
        this.loadingStatus = new LoadingStatus();
        this.dataFetcher_ = props.dataFetcher;
        this.setDebounceInterval(props.debounceInterval);
    }

    /** Invoke data retrieval. It will be debounced if a debounceInterval is set*/
    fetchData(params: PARAMS) {
        this.cancelPendingRequest();
        const debouncedRequest = this.debouncedRequest_;
        if (debouncedRequest) {
            return new Promise<RESPONSE>((resolve, reject) => {
                return debouncedRequest(params, resolve, reject);
            });
        } else {
            return this.invokeFetchRequest_(params);
        }
    }

    /** Set the data retrieval debounce interval in milliseconds */
    setDebounceInterval(debounceInterval: number | undefined) {
        if (debounceInterval) {
            this.debouncedRequest_ = debounce(
                (params: PARAMS, resolve: (value: RESPONSE | PromiseLike<RESPONSE>) => void, reject: (reason: any) => void) => {
                    if (!this.debouncedRequest_) {
                        // debounce has been unset
                        return;
                    }
                    this.invokeFetchRequest_(params).then(
                        (response) => {
                            resolve(response);
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                },
                debounceInterval
            );
        } else {
            delete this.debouncedRequest_;
        }
    }

    /** Cancel any pending data request */
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

    protected invokeFetchRequest_(params: PARAMS) {
        this.loadingStatus.setValue(LoadingState.Loading);
        const dataRequest = this.dataFetcher_(params);

        const requestWrapper = CancelablePromise(
            new Promise<RESPONSE>((resolve, reject) => {
                dataRequest
                    .then(
                        (data) => {
                            if (!requestWrapper.isCanceled) {
                                resolve(data);
                                this.loadingStatus.setValue(LoadingState.Success);
                            }
                        },
                        (error) => {
                            if (!requestWrapper.isCanceled) {
                                reject(error);
                                this.loadingStatus.update({
                                    value: LoadingState.Error,
                                    message: error.message
                                });
                            }
                        }
                    )
                    .finally(() => {
                        if (requestWrapper === this.pendingDataRequest_) {
                            delete this.pendingDataRequest_;
                        }
                    });
            }),
            () => {
                if (dataRequest.cancel) {
                    dataRequest.cancel();
                }
            }
        );

        this.pendingDataRequest_ = requestWrapper;
        return requestWrapper;
    }
}
