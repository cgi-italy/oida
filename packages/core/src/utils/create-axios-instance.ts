import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { CancelablePromise } from './cancelable-promise';

const cancelableRequest = function <T = any, R = AxiosResponse<T>>(this: AxiosInstance, config: AxiosRequestConfig) {
    const abortController = new AbortController();

    const request = this.request<T, R>({
        ...config,
        signal: abortController.signal
    });

    return CancelablePromise(request, abortController.abort);
};

export type AxiosInstanceWithCancellation = AxiosInstance & {
    cancelableRequest: typeof cancelableRequest;
};

export const createAxiosInstance = (config?: AxiosRequestConfig) => {
    const instance = axios.create(config) as AxiosInstanceWithCancellation;
    //@ts-ignore
    instance.cancelableRequest = cancelableRequest.bind(instance);
    return instance;
};
