import React from 'react';

import { useObserver } from 'mobx-react';

import { Button } from 'antd';
import { PictureOutlined, FullscreenExitOutlined, ClockCircleOutlined } from '@ant-design/icons';

import { LoadingState } from '@oida/core';
import { IEntitySelection, IQueryParams } from '@oida/state-mst';
import { IDatasetProducts, IDatasetProduct } from '@oida/eo';
import { useEntityCollectionList, useDataPaging, useDataSorting, useCenterOnMapFromModule } from '@oida/ui-react-mst';
import { DataCollectionList } from '@oida/ui-react-antd';


import { DatasetSearchResultsItem } from './dataset-search-results-item';

//TODO: allow to pass the filter list from outside

export type DatasetSearchResultsListProps = {
    results: IDatasetProducts,
    loadingState: LoadingState,
    selection: IEntitySelection,
    queryParams: IQueryParams,
    onVisualizeItemAction: (item: IDatasetProduct) => void;
    itemContent?: (item: IDatasetProduct) => React.ReactNode
};

export const DatasetSearchResultsList = ({
    results, loadingState, selection, queryParams, itemContent, onVisualizeItemAction
}: DatasetSearchResultsListProps) => {

    let centerOnMap = useCenterOnMapFromModule();

    let items = useEntityCollectionList<IDatasetProduct>({
        collection: results,
        entitySelection: selection,
        actions: [
            {
                name: 'Visualize',
                callback: (item) => {
                    centerOnMap(item.geometry, {animate: true});
                    onVisualizeItemAction(item);
                },
                icon: <Button size='small' type='primary'><PictureOutlined/></Button>
            },
            {
                name: 'Center on map',
                callback: (item) => centerOnMap(item.geometry, {animate: true}),
                icon: <Button size='small' type='primary'><FullscreenExitOutlined/></Button>
            }
        ]
    });

    let paging = useDataPaging(queryParams.paging);

    let sorting = useDataSorting({
        sortableFields: [{key: 'dc:date', name: 'Acquisition time'}],
        sortingState: queryParams.sorting
    });

    if (!items) {
        return null;
    }

    return (
        <DataCollectionList<IDatasetProduct>
            className='dataset-search-results-list'
            content={itemContent}
            extra={(item) => <img style={{maxHeight: '128px'}} src={item.preview}/>}
            items={{
                ...items,
                loadingState: loadingState
            }}
            itemLayout='vertical'
            paging={paging}
            sorting={sorting}
            autoScrollOnSelection={false}
        />
    );
};

DatasetSearchResultsList.defaultProps = {
    itemContent: (item) => (
        <DatasetSearchResultsItem
            metadata={[{
                label: (<ClockCircleOutlined />),
                value: item.start.toISOString(),
                description: 'Sensing time'
            }]}
        />
    )
};
