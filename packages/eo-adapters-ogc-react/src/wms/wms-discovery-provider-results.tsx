import React from 'react';

import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { STRING_FIELD_ID, IFormFieldDefinition } from '@oida/core';

import { useEntityCollectionList, useDataPaging, useDataSorting, useFormData, useSelector } from '@oida/ui-react-mobx';
import { DataCollectionList } from '@oida/ui-react-antd';
import { DatasetExplorer } from '@oida/eo-mobx';


import {
    WmsDatasetDiscoveryProvider, WmsDatasetDiscoveryProviderItem,
 } from '@oida/eo-adapters-ogc';

import { useQueryCriteriaUrlBinding, useQueryFiltersBreadcrumbBindingFromModule } from '@oida/ui-react-mobx';
import { WmsDiscoveryProviderLayerItem } from './wms-discovery-provider-layer-item';

export type WmsDiscoveryProviderResultsProps = {
    provider: WmsDatasetDiscoveryProvider,
    datasetExplorer: DatasetExplorer
};

export const WmsDiscoveryProviderResults = (props: WmsDiscoveryProviderResultsProps) => {

    const searchFilters: IFormFieldDefinition[] = [
        {
            name: 'search',
            type: STRING_FIELD_ID,
            config: {},
            rendererConfig: {
                props: {
                    prefix: (<SearchOutlined/>)
                }
            }
        }
    ];

    const actions = [
        {
            name: 'Add to map',
            content: 'Add to map',
            icon: (<PlusOutlined/>),
            callback: (item: WmsDatasetDiscoveryProviderItem) => {
                props.provider.createDataset(item).then((datasetConfig) => {
                    if (datasetConfig) {
                        props.datasetExplorer.addDataset(datasetConfig);
                    }
                });
            },
            condition: (entity) => {
                return true;
            }
        }
    ];

    // TODO: enable once the redirect base url issue is fixed
    // useQueryCriteriaUrlBinding({
    //     criteria: props.provider.criteria
    // });

    // useQueryFiltersBreadcrumbBindingFromModule({
    //     filtersConfig: searchFilters,
    //     filteringState: props.provider.criteria.filters
    // });

    const loadingState = useSelector(() => props.provider.loadingState.value);

    let pagingProps = useDataPaging(props.provider.criteria.paging);

    let filteringProps = useFormData({
        fieldValues: props.provider.criteria.filters,
        fields: searchFilters
    });

    let sortingProps = useDataSorting({
        sortableFields: [{key: 'Title', name: 'Name'}],
        sortingState: props.provider.criteria.sorting
    });

    let items = useEntityCollectionList<WmsDatasetDiscoveryProviderItem>({
        items: props.provider.results,
        actions: actions
    });

    if (!items) {
        return null;
    }

    return (
        <div className='wms-discovery-provider-service'>
            <DataCollectionList<WmsDatasetDiscoveryProviderItem>
                className='dataset-discovery-results wms-discovery-layer-list'
                content={(item) => <WmsDiscoveryProviderLayerItem wmsDiscoveryItem={item}/>}
                items={{
                    ...items,
                    loadingState: loadingState
                }}
                itemLayout='vertical'
                paging={pagingProps}
                sorting={sortingProps}
                filters={filteringProps
                    ? {
                        ...filteringProps,
                        mainFilter: 'search'
                    }
                    : undefined
                }
                autoScrollOnSelection={false}
            />
        </div>
    );
};
