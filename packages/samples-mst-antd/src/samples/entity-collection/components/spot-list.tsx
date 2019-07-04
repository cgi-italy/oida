import React from 'react';

import { ISpotCollection, ISpot } from '../store';

import { LoadingState } from '@oida/core';
import { IEntitySelection, IQueryParams } from '@oida/state-mst';
import { useEntityCollectionList, useDataPaging, useDataFiltering, useDataSorting } from '@oida/ui-react-mst';
import { DataCollectionList, DataCollectionTable } from '@oida/ui-react-antd';

export type SpotListProps = {
    spots: ISpotCollection,
    selection: IEntitySelection,
    loadingState: LoadingState,
    queryParams: IQueryParams
};

export const SpotList = ({spots, selection, loadingState, queryParams}: SpotListProps) => {

    let { data, keyGetter, itemSelector, onHoverAction, onSelectAction } = useEntityCollectionList<ISpot>({
        collection: spots,
        entitySelection: selection
    });

    let paging = useDataPaging(queryParams.paging);
    let filtering = useDataFiltering({
        filters: [{
            name: 'name',
            type: 'string',
            config: {}
        }],
        filteringState: queryParams.filters
    });

    let sorting = useDataSorting({
        sortableFields: [{key: 'name', name: 'Name'}],
        sortingState: queryParams.sorting
    });

    return (
        <React.Fragment>
            {<DataCollectionTable<ISpot>
                items={{data, keyGetter, itemSelector, onHoverAction, onSelectAction, loadingState}}
                columns={[
                    {
                        title: 'ID',
                        dataIndex: 'id'
                    },
                    {
                        title: 'Name',
                        dataIndex: 'name'
                    }
                ]}
                paging={paging}
                sorting={sorting}
            />}
            <DataCollectionList<ISpot>
                meta={(item) => {
                    return {
                        title: item.name,
                        description: item.name
                    };
                }}
                items={{data, keyGetter, itemSelector, onHoverAction, onSelectAction, loadingState: loadingState}}
                paging={paging}
                filters={filtering}
                sorting={sorting}

            />
        </React.Fragment>
    );
};
