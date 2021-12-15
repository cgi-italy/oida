import { QueryParams, STRING_FIELD_ID } from '@oidajs/core';
import { DatasetProductSearchProvider } from '@oidajs/eo-mobx';
import { AdamOpenSearchClient } from '../common';

export type AdamOpenSearchProductSearchProviderConfig = {
    openSearchClient: AdamOpenSearchClient;
    datasetId: string;
};

export class AdamOpenSearchProductSearchProvider implements DatasetProductSearchProvider {

    protected openSearchClient_: AdamOpenSearchClient;
    protected datasetId_: string;

    constructor(config: AdamOpenSearchProductSearchProviderConfig) {
        this.openSearchClient_ = config.openSearchClient;
        this.datasetId_ = config.datasetId;
    }

    searchProducts(queryParams: QueryParams) {
        return this.openSearchClient_.searchProducts({
            ...queryParams,
            filters: [...(queryParams.filters || []), {
                key: 'datasetId',
                type: STRING_FIELD_ID,
                value: this.datasetId_
            }]
        }).then((data) => {
            return {
                total: data.properties.totalResults,
                results: data.features.map((product) => {
                    return {
                        start: new Date(product.metadata.date),
                        metadata: product,
                        geometry: product.geometry
                    };
                })
            };
        });
    }
}
