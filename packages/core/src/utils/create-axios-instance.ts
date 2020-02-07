import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';

export type CancelablePromise<T> = {
    readonly [Symbol.toStringTag]: string;
    then<TResult1 = T, TResult2 = never>(
            onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
            onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): CancelablePromise<TResult1 | TResult2>;
    catch<TResult = never>(
        onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): CancelablePromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): CancelablePromise<T>
    cancel(): void;
};


export type CancelableAxiosPromise<T> = CancelablePromise<AxiosResponse<T>>;


const cancelableRequest = function<T = any>(this: AxiosInstance, config: AxiosRequestConfig) {
    let source = axios.CancelToken.source();

    let request = <CancelableAxiosPromise<T>><unknown>(this).request<T>({
        ...config,
        cancelToken: source.token
    }).catch((error) => {
        if (axios.isCancel(error)) {
            throw {
                status: 499,
                statusText: 'Canceled'
            };
        } else {
            throw error;
        }
    });

    const cancelableThen = function(...args) {
        // @ts-ignore
        let newResponse =  Promise.prototype.then.apply(this, args);
        newResponse['cancel'] = source.cancel;
        newResponse.then = cancelableThen;
        return newResponse;
    };

    const cancelableCatch = function(...args) {
        // @ts-ignore
        let newResponse =  Promise.prototype.catch.apply(this, args);
        newResponse['cancel'] = source.cancel;
        newResponse.catch = cancelableCatch;
        return newResponse;
    };

    request.then = cancelableThen;
    request.catch = cancelableCatch;
    request.cancel = source.cancel;

    return request;
};

export type AxiosInstanceWithCancellation = AxiosInstance & {
    cancelableRequest: typeof cancelableRequest;
};

export const createAxiosInstance = (config?: AxiosRequestConfig) => {
    let instance = axios.create(config);
    instance['cancelableRequest'] = cancelableRequest.bind(instance);
    return <AxiosInstanceWithCancellation>(instance);
};

export const wrapInCancelablePromise = <T>(promise: Promise<T>) => {

    let onPromiseCancel;

    let promiseWrapper = new Promise((resolve, reject) => {

        let isCanceled = false;

        onPromiseCancel = () => {
            isCanceled = true;
            reject({
                status: 499,
                statusText: 'Canceled'
            });
        };

        promise.then((response) => {
            if (!isCanceled) {
                resolve(response);
            }
        }).catch((reason) => {
            if (!isCanceled) {
                reject(reason);
            }
        });
    });

    promiseWrapper['cancel'] = () => {
        onPromiseCancel();
    };

    return promiseWrapper as CancelablePromise<T>;

};
