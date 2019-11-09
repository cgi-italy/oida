import { QueryParams, SortOrder, AxiosInstanceWithCancellation, createAxiosInstance } from '@oida/core';

import { DatasetSearchProvider } from '../dataset-search-provider';
import { ProductSearchRecord } from '../dataset-product';

type FeatureParser = (feature) => ProductSearchRecord;
type FilterSerializer = (filters) => undefined | {[key: string]: string};

export type WFSSearchProviderConfig = {
    serviceUrl: string;
    typeName: string;
    filterSerializer: FilterSerializer;
    featureParser: FeatureParser;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export class WFSSearchProvider implements DatasetSearchProvider {

    protected serviceUrl_: string;
    protected typeName_: string;
    protected filterSerializer_: FilterSerializer;
    protected featureParser_: FeatureParser;
    protected axiosInstance_: AxiosInstanceWithCancellation;

    constructor(config: WFSSearchProviderConfig) {
        this.serviceUrl_ = config.serviceUrl;
        this.typeName_ = config.typeName;
        this.filterSerializer_ = config.filterSerializer;
        this.featureParser_ = config.featureParser;
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
    }

    searchProducts(queryParams: QueryParams) {
        return this.axiosInstance_.cancelableRequest({
            url: this.serviceUrl_,
            params: {
                service: 'WFS',
                version: '2.0.0',
                request: 'GetFeature',
                outputFormat: 'application/json',
                typeNames: this.typeName_,
                ...this.getWFSParams_(queryParams)
            },
            paramsSerializer: (params) => {
                let urlParams: string[] = [];
                for (let key in params) {
                    urlParams.push(`${key}=${params[key]}`);
                }
                return urlParams.join('&');
            }
        }).then((response) => {
            return {
                total: response.data.totalFeatures,
                results: response.data.features.map(this.featureParser_)
            };
        });
    }

    protected getWFSParams_(queryParams: QueryParams) {
        let wfsParams: any = {};

        if (queryParams.paging) {
            wfsParams.startIndex = queryParams.paging.offset;
            wfsParams.count = queryParams.paging.pageSize;
        }
        if (queryParams.sortBy) {
            wfsParams.sortBy = `${queryParams.sortBy.key}+${queryParams.sortBy.order === SortOrder.Ascending ? 'A' : 'D'}`;
        }

        if (queryParams.filters) {
            wfsParams = {
                ...wfsParams,
                ...this.filterSerializer_(queryParams.filters)
            };
        }

        return wfsParams;
    }
}
