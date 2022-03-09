import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { CancelablePromise } from './cancelable-promise';

const cancelableRequest = function <T = any, R = AxiosResponse<T>>(this: AxiosInstance, config: AxiosRequestConfig) {
    const source = axios.CancelToken.source();

    const request = this.request<T, R>({
        ...config,
        cancelToken: source.token
    });

    return CancelablePromise(request, source.cancel);
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
