import React from 'react';

import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { STRING_FIELD_ID, IFormFieldDefinition } from '@oida/core';

import { useEntityCollection } from '@oida/ui-react-mobx';
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
                return props.provider.createDataset(item).then((datasetConfig) => {
                    if (datasetConfig) {
                        props.datasetExplorer.addDataset(datasetConfig);
                    }
                });
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

    const collectionListProps = useEntityCollection({
        items: props.provider.results,
        actions: actions,
        loadingState: props.provider.loadingState,
        queryParams: props.provider.criteria,
        filtering: {
            filters: searchFilters,
            mainFilter: 'search'
        },
        sortableFields: [{key: 'Title', name: 'Name'}],
    });

    if (!collectionListProps) {
        return null;
    }

    return (
        <div className='wms-discovery-provider-service'>
            <DataCollectionList<WmsDatasetDiscoveryProviderItem>
                className='dataset-discovery-results wms-discovery-layer-list'
                content={(item) => <WmsDiscoveryProviderLayerItem wmsDiscoveryItem={item}/>}
                size='default'
                itemLayout='vertical'
                autoScrollOnSelection={false}
                {...collectionListProps}
            />
        </div>
    );
};
