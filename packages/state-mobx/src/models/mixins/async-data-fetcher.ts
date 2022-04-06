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

type DebouncedRequestType<PARAMS = any> = (params: PARAMS) => void;

/**
 * A class to manage async data fetching logic with loading state tracking and optional debouncing.
 * @template RESPONSE the async response type
 * @template PARAMS the params input of the data fetch method
 */
export class AsyncDataFetcher<RESPONSE = any, PARAMS = any> implements HasLoadingStatus {
    /** The data fetching loading state */
    readonly loadingStatus: LoadingStatus;

    protected debouncedRequest_: DebouncedRequestType<PARAMS> | undefined;
    protected debouncedPromise_:
        | {
              instance: Promise<RESPONSE>;
              resolve: (value: any) => void;
              reject: (reason: any) => void;
          }
        | undefined;

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
            if (!this.debouncedPromise_) {
                // store the promise for the current debounced request.
                // the same promise will be returned for subsequent call to
                // fetchData until the request is resolved
                const debouncedPromise = new Promise<RESPONSE>((resolve, reject) => {
                    this.debouncedPromise_ = {
                        instance: debouncedPromise,
                        resolve: resolve,
                        reject: reject
                    };
                });
                this.debouncedPromise_!.instance = debouncedPromise;
            }
            debouncedRequest(params);
            return this.debouncedPromise_!.instance;
        } else {
            return this.invokeFetchRequest_(params);
        }
    }

    /** Set the data retrieval debounce interval in milliseconds */
    setDebounceInterval(debounceInterval: number | undefined) {
        if (debounceInterval) {
            this.debouncedRequest_ = debounce((params: PARAMS) => {
                this.invokeFetchRequest_(params)
                    .then(
                        (response) => {
                            if (this.debouncedPromise_) {
                                this.debouncedPromise_.resolve(response);
                            }
                        },
                        (error) => {
                            if (this.debouncedPromise_) {
                                this.debouncedPromise_.reject(error);
                            }
                        }
                    )
                    .finally(() => {
                        this.debouncedPromise_ = undefined;
                    });
            }, debounceInterval);
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
                                this.loadingStatus.setValue(LoadingState.Success);
                                resolve(data);
                            }
                        },
                        (error) => {
                            if (!requestWrapper.isCanceled) {
                                this.loadingStatus.update({
                                    value: LoadingState.Error,
                                    message: error.message
                                });
                                reject(error);
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
