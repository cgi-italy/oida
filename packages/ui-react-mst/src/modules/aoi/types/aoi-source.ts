import { reaction } from 'mobx';
import { types, Instance, addDisposer, flow } from 'mobx-state-tree';

import { QueryParams, Geometry, LoadingState } from '@oida/core';
import { QueryParams as QueryParamsState, hasConfig, hasAsyncData, IndexedCollection } from '@oida/state-mst';

import { AOICollection } from './aoi';

export type AoiSourceItem = {
    id: string;
    name: string;
    geometry: Geometry;
    properties: GeoJSON.GeoJsonProperties
};

export type AoiSourceProvider = (params: QueryParams) => Promise<{
    total: number,
    results: AoiSourceItem[]
}>;

export type AoiSourceConfig = {
    provider: AoiSourceProvider;
    propertyKeys?: string[];
    lazy?: boolean;
};

const AoiSourceDecl = types.compose('AoiSource',
    types.model('AoiSource', {
        id: types.identifier,
        name: types.string,
        aoiColor: types.optional(types.string, '#EEEEEE'),
        queryParams: types.optional(QueryParamsState, {}),
        aois_: types.optional(AOICollection, {})
    }),
    hasConfig<AoiSourceConfig>(),
    hasAsyncData
)
.actions(self => (
    {
        retrieveAois: flow(function*(params) {
            try {
                let response = yield self.retrieveData(() => self.config.provider(params));
                self.aois_.clear();
                self.aois_.add(response.results.map(aoi => {
                    return {
                        ...aoi,
                        defaultColor: self.aoiColor
                    };
                }));
                self.queryParams.paging.setTotal(response.total);
            } catch (e) {
                self.aois_.clear();
                self.queryParams.paging.setTotal(0);
            }
        }),
        afterAttach: () => {
            let dataRetrieveDisposer = reaction(
                () => self.queryParams.data,
                (queryParams) => {
                    (self as any).retrieveAois(queryParams);
                },
                {
                    fireImmediately: !self.config.lazy
                }
            );
            addDisposer(self, dataRetrieveDisposer);
        }
    }
)).views((self) => ({
    get aois() {
        if (self.config.lazy && self.loadingState === LoadingState.Init) {
            self.retrieveAois(self.queryParams.data);
        }
        return self.aois_;
    }
}));


type AoiSourceType = typeof AoiSourceDecl;
export interface AoiSourceInterface extends AoiSourceType {}
export const AoiSource: AoiSourceInterface = AoiSourceDecl;
export interface IAoiSource extends Instance<AoiSourceInterface> {}

const AoiSourceCollectionDecl = IndexedCollection(AoiSource);
type AoiSourceCollectionType = typeof AoiSourceCollectionDecl;
export interface AoiSourceCollectionInterface extends AoiSourceCollectionType {}
export const AoiSourceCollection: AoiSourceCollectionInterface = AoiSourceCollectionDecl;
export interface IAoiSourceCollection extends Instance<AoiSourceCollectionInterface> {}
