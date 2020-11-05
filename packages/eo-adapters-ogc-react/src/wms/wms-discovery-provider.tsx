import React, { useMemo, useEffect } from 'react';

import { Select, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, PictureOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { STRING_FIELD_ID } from '@oida/core';

import { useEntityCollectionList, useDataPaging, useDataSorting, useDataFiltering, BreadcrumbItem, useSelector } from '@oida/ui-react-mobx';
import { DataCollectionList } from '@oida/ui-react-antd';
import { DatasetConfig, DatasetExplorer } from '@oida/eo-mobx';

import { DatasetDiscoveryProviderFactory, DatasetDiscoveryResultItem } from '@oida/eo-mobx-react';
import {
    WmsDatasetDiscoveryProvider, WMS_DATASET_DISCOVERY_PROVIDER_TYPE, WmsDatasetDiscoveryProviderItem,
    WmsService, WmsLayerPreviewMode
 } from '@oida/eo-adapters-ogc';

import { useQueryCriteriaUrlBinding, useQueryFiltersBreadcrumbBindingFromModule } from '@oida/ui-react-mobx';


type WmsDiscoveryLayerItemProps = {
    wmsDiscoveryItem: WmsDatasetDiscoveryProviderItem
};

const WmsDiscoveryLayerItem = (props: WmsDiscoveryLayerItemProps) => {

    const layerData = useMemo(() => {

        const meta: any[] = [];

        const layer = props.wmsDiscoveryItem.layer;

        if (layer.Title) {
            meta.push({
                label: (
                    <Tooltip title='Source name'>
                        <PictureOutlined />
                    </Tooltip>
                ),
                value: layer.Title
            });
        }

        if (layer.Abstract) {
            meta.push({
                label: (
                    <Tooltip title='Description'>
                        <InfoCircleOutlined />
                    </Tooltip>
                ),
                value: layer.Abstract
            });
        }

        let preview: Promise<string> | undefined;

        if (props.wmsDiscoveryItem.service && layer.Name && !props.wmsDiscoveryItem.disablePreview) {
            preview = props.wmsDiscoveryItem.service.getLayerPreview(layer.Name, {
                width: 128,
                mode: WmsLayerPreviewMode.KeepRatio,
                transparent: true
            });
        }

        return {
            metadata: meta,
            preview: preview
        };

    }, []);

    return (
        <DatasetDiscoveryResultItem
            metadata={layerData.metadata}
            actions={[]}
            preview={layerData.preview}
            title={props.wmsDiscoveryItem.layer.Name}
        />
    );
};

export type WmsDiscoveryProviderResultsProps = {
    provider: WmsDatasetDiscoveryProvider,
    datasetExplorer: DatasetExplorer
};

export const WmsDiscoveryProviderResults = (props: WmsDiscoveryProviderResultsProps) => {

    const searchFilters = [
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

    useQueryCriteriaUrlBinding({
        criteria: props.provider.criteria
    });

    useQueryFiltersBreadcrumbBindingFromModule({
        filtersConfig: searchFilters,
        filteringState: props.provider.criteria.filters
    });

    const loadingState = useSelector(() => props.provider.loadingState.value);

    let pagingProps = useDataPaging(props.provider.criteria.paging);

    let filteringProps = useDataFiltering({
        filteringState: props.provider.criteria.filters,
        filters: searchFilters
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
                content={(item) => <WmsDiscoveryLayerItem wmsDiscoveryItem={item}/>}
                items={{
                    ...items,
                    loadingState: loadingState
                }}
                itemLayout='vertical'
                paging={pagingProps}
                sorting={sortingProps}
                filters={filteringProps}
                autoScrollOnSelection={false}
            />
        </div>
    );
};

export type WmsDiscoveryProviderProps = {
    provider: WmsDatasetDiscoveryProvider,
    datasetExplorer: DatasetExplorer
};

export const WmsDiscoveryProvider = (props: WmsDiscoveryProviderProps) => {

    const serviceOptions = useSelector(() => {
        return props.provider.services.map((service) => {
            return (
                <Select.Option
                    key={service.id}
                    value={service.id}
                >
                    {service.name}
                </Select.Option>
            );
        });
    });

    const selectedWms = useSelector(() => props.provider.selectedService);

    return (
        <div className='wms-discovery-provider'>
            {selectedWms && <BreadcrumbItem
                data={{
                    key: selectedWms.id,
                    title: selectedWms.name,
                    onClick: () => props.provider.criteria.reset()
                }}
            />}
            <div>
                <label>Service:</label>
                <Select
                    value={selectedWms?.id}
                    onChange={(value) => props.provider.selectService(value)}
                >
                    {serviceOptions}
                </Select>
            </div>
            {selectedWms && <WmsDiscoveryProviderResults
                datasetExplorer={props.datasetExplorer}
                provider={props.provider}
            />}
        </div>
    );
};

DatasetDiscoveryProviderFactory.register(WMS_DATASET_DISCOVERY_PROVIDER_TYPE, (config) => {
    return (
        <WmsDiscoveryProvider
            {...config}
        />
    );
});
