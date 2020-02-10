import React from 'react';

import { ISpotCollection, ISpot, generateIconForStyle } from '../../../common';

import { LoadingState } from '@oida/core';
import { IEntitySelection, IQueryParams } from '@oida/state-mst';
import { useEntityCollectionList, useDataPaging, useDataFiltering, useDataSorting } from '@oida/ui-react-mst';
import { DataCollectionList, DataCollectionTable } from '@oida/ui-react-antd';

import './spot-list.scss';

export type SpotListProps = {
    spots: ISpotCollection,
    selection: IEntitySelection,
    loadingState: LoadingState,
    queryParams: IQueryParams
};

export const SpotList = ({spots, selection, loadingState, queryParams}: SpotListProps) => {

    const collectionData = useEntityCollectionList<ISpot>({
        collection: spots,
        entitySelection: selection,
        iconGetter: (item) => {
            return generateIconForStyle({
                style: item.style.point!,
                geometryType: 'Point'
            });
        }
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
        sortableFields: [{key: 'name', name: 'Name'}, {key: 'type', name: 'Type'}],
        sortingState: queryParams.sorting
    });

    if (!collectionData) {
        return null;
    }

    const TypeCell = ({item}) => {
        let { icon } = collectionData.itemSelector(item);
        return  (
            <span>{icon}{item.type}</span>
        );
    };

    return (
        <div className='spot-list'>
            {<DataCollectionTable<ISpot>
                items={{...collectionData, loadingState}}
                columns={[
                    {
                        title: 'ID',
                        dataIndex: 'id'
                    },
                    {
                        title: 'Name',
                        dataIndex: 'name'
                    },
                    {
                        title: 'Type',
                        key: 'type',
                        render: (item) => {
                            return <TypeCell item={item}/>;
                        }
                    }
                ]}
                paging={paging}
                sorting={sorting}
            />}
            <DataCollectionList<ISpot>
                meta={(item) => {
                    return {
                        title: item.name,
                        description: item.id
                    };
                }}
                items={{...collectionData, loadingState: loadingState}}
                paging={paging}
                filters={filtering}
                sorting={sorting}

            />
        </div>
    );
};
