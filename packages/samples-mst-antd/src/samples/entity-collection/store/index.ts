import React from 'react';

import { reaction } from 'mobx';
import { types, addDisposer, applySnapshot } from 'mobx-state-tree';

import { LoadingState } from '@oida/core';
import { QueryParams, EntitySelection, hasLoadingState } from '@oida/state-mst';

import { SpotCollection, getSpots } from '../../../common';

export const AppStateModel = types.compose(
    types.model('AppState', {
        spots: types.optional(SpotCollection, {}),
        selection: types.optional(EntitySelection, {
            id: 'selection'
        }),
        criteria: types.optional(QueryParams, {})
    }),
    hasLoadingState
)
.actions((self) => {
    return {
        getSpots: (queryData) => {
            self.setLoadingState(LoadingState.Loading);
            getSpots(queryData).then((response: any) => {
                applySnapshot(self.spots.items, response.results);
                self.criteria.paging.setTotal(response.total);
                self.setLoadingState(LoadingState.Success);
            });
        }
    };
})
.actions((self) => {
    return {
        afterCreate: () => {
            const queryUpdateDisposer = reaction(() => self.criteria.data, (queryData) => {
                self.getSpots(queryData);
            }, {
                fireImmediately: true
            });

            addDisposer(self, queryUpdateDisposer);
        }
    };
});

export const AppContext = React.createContext(AppStateModel.create({
    spots: {
        items: []
    },
    criteria: {
        paging: {
            pageSize: 10
        }
    }
}));

export * from './spot';
