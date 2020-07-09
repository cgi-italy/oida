import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { CancelablePromise } from './cancelable-promise';

const cancelableRequest = function<T = any>(this: AxiosInstance, config: AxiosRequestConfig) {

    let source = axios.CancelToken.source();

    let request = this.request<T>({
        ...config,
        cancelToken: source.token
    });

    return CancelablePromise(request, source.cancel);
};

export type AxiosInstanceWithCancellation = AxiosInstance & {
    cancelableRequest: typeof cancelableRequest;
};

export const createAxiosInstance = (config?: AxiosRequestConfig) => {
    let instance = axios.create(config) as AxiosInstanceWithCancellation;
    instance.cancelableRequest = cancelableRequest.bind(instance);
    return <AxiosInstanceWithCancellation>(instance);
};
