import { action, reaction, computed } from 'mobx';

import { QueryParams, LoadingState } from '@oida/core';
import { AsyncDataFetcher, QueryParams as QueryParamsState, QueryParamsProps, IndexedCollection } from '@oida/state-mobx';

import { AoiProps, Aoi } from './aoi';


export type AoiSourceProviderResponse = {
    total: number;
    results: AoiProps[];
};

export type AoiSourceProvider = (params: QueryParams) => Promise<AoiSourceProviderResponse>;


export type AoiSourceProps = {
    id: string;
    name: string;
    queryParams?: QueryParamsProps;
    provider: AoiSourceProvider;
    propertiesSchema?: Record<string, any>
    lazy?: boolean;
};

export class AoiSource {
    readonly id: string;
    readonly name: string;
    readonly queryParams: QueryParamsState;
    readonly propertiesSchema: Record<string, any> | undefined;

    protected readonly dataFetcher: AsyncDataFetcher<AoiSourceProviderResponse, QueryParams>;
    protected readonly aois_: IndexedCollection<Aoi>;
    protected readonly lazy_: boolean;

    constructor(props: AoiSourceProps) {
        this.id = props.id;
        this.name = props.name;
        this.queryParams = new QueryParamsState(props.queryParams);
        this.propertiesSchema = props.propertiesSchema;
        this.aois_ = new IndexedCollection({
            idGetter: (aoi) => aoi.id
        });
        this.dataFetcher = new AsyncDataFetcher({
            dataFetcher: (params) => {
                return props.provider(params);
            }
        });
        this.lazy_ = props.lazy || false;

        this.afterInit_();
    }

    get loadingStatus() {
        return this.dataFetcher.loadingStatus;
    }

    get aois() {
        if (this.lazy_ && this.dataFetcher.loadingStatus.value === LoadingState.Init) {
            this.retrieveAois_();
        }
        return this.aois_;
    }

    protected afterInit_() {
        reaction(
            () => this.queryParams.data,
            () => {
                this.retrieveAois_();
            },
            {
                fireImmediately: !this.lazy_
            }
        );
    }

    protected retrieveAois_() {
        this.aois_.clear();
        this.dataFetcher.fetchData(this.queryParams.data).then((data) => {
            this.queryParams.paging.setTotal(data.total);
            this.aois.add(data.results.map((aoiProps) => {
                return new Aoi(aoiProps);
            }));
        }, (error) => {
            this.queryParams.paging.setTotal(0);
        });
    }
}
