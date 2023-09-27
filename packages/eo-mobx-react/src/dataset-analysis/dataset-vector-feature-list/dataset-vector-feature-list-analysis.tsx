import React, { useEffect, useMemo, useState } from 'react';
import { autorun } from 'mobx';
import { Empty } from 'antd';
import { ColumnType } from 'antd/es/table';

import {
    createPropertiesDescriptorFromFeatures,
    DatasetVectorFeature,
    DatasetVectorFeatureList,
    DatasetVectorFeatureListAnalysis,
    DATASET_VECTOR_FEATURE_LIST_PROCESSING,
    getFormFieldsForVectorDescriptor
} from '@oidajs/eo-mobx';
import {
    useCenterOnMapFromModule,
    useDataPaging,
    useDataSorting,
    useEntityCollectionList,
    useFormData,
    useSelector
} from '@oidajs/ui-react-mobx';
import { DataSortField } from '@oidajs/ui-react-core';
import { DataCollectionTable } from '@oidajs/ui-react-antd';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { DatasetVectorFeatureInfo } from '../../dataset-map-viz';
import { formatVectorFeatureProperty } from '../../utils';
import { AnalysisAoiFilter } from '../analysis-aoi-filter';

export type DatasetVectorFeatureListTableProps = {
    processing: DatasetVectorFeatureList;
};

export const DatasetVectorFeatureListTable = (props: DatasetVectorFeatureListTableProps) => {
    const [featureDescriptor, setFeatureDescriptor] = useState(props.processing.config.featureDescriptor);

    useEffect(() => {
        if (!featureDescriptor && props.processing.data.length) {
            setFeatureDescriptor({
                properties: createPropertiesDescriptorFromFeatures(props.processing.data.map((feature) => feature.properties))
            });
        }
    }, [props.processing.data.length]);

    const filteringFields = useMemo(() => {
        if (!featureDescriptor) {
            return [];
        }
        const filters = getFormFieldsForVectorDescriptor(featureDescriptor);
        return filters;
    }, [featureDescriptor]);

    const loadingState = useSelector(() => props.processing.loadingState.value);
    const pagingProps = useDataPaging(props.processing.queryParams.paging);

    const sortableFields: DataSortField[] = [];

    const columns: ColumnType<DatasetVectorFeature>[] = (featureDescriptor?.properties || []).map((property) => {
        if (property.sortable) {
            sortableFields.push({
                key: property.id,
                name: property.name
            });
        }
        return {
            title: property.name,
            dataIndex: ['properties', property.id],
            key: property.id,
            ellipsis: true,
            render: (value) => {
                const formattedValue = formatVectorFeatureProperty(property, value);
                return <span className='table-cell-content'>{formattedValue}</span>;
            }
        };
    });

    const sortingProps = useDataSorting({
        sortingState: props.processing.queryParams.sorting,
        sortableFields: sortableFields
    });

    const items = useEntityCollectionList({
        items: props.processing.data
    });

    const filteringProps = useFormData({
        fields: filteringFields,
        fieldValues: props.processing.queryParams.filters
    });

    const centerOnMap = useCenterOnMapFromModule();

    if (!columns.length || !items) {
        return null;
    }

    return (
        <div className='dataset-vector-feature-list-table  dataset-vector-feature-info-table'>
            <div className='table-controls'>
                <span className='table-items-info'>{pagingProps?.total} features</span>
            </div>
            <DataCollectionTable<DatasetVectorFeature>
                className='table-content'
                items={{
                    ...items,
                    loadingState: loadingState,
                    onDefaultAction: (item) => {
                        centerOnMap(item.geometry, { animate: true });
                    }
                }}
                extraHeaderContent={
                    <div className='dataset-vector-feature-list-aoi-filter'>
                        <span>Area: </span>
                        <AnalysisAoiFilter analysis={props.processing} supportedGeometries={props.processing.config.supportedGeometries} />
                    </div>
                }
                fullHeight={true}
                paging={pagingProps}
                sorting={sortingProps}
                filters={filteringProps}
                columns={columns}
                tableLayout='auto'
                expandable={{
                    expandedRowRender: (record) => {
                        return <DatasetVectorFeatureInfo vectorFeature={record} featureDescriptor={featureDescriptor} />;
                    }
                }}
            />
        </div>
    );
};

export const DatasetVectorFeatureListAnalysisWidget = (props: DatasetAnalysisWidgetFactoryConfig) => {
    const processing = useSelector(() => (props.combinedAnalysis as DatasetVectorFeatureListAnalysis).processing);
    useEffect(() => {
        const reactionDisposer = autorun(() => {
            if (processing) {
                const explorerItem = props.datasetExplorerItems.find((item) => item.dataset.id === processing.dataset.id);
                if (!explorerItem) {
                    (props.combinedAnalysis as DatasetVectorFeatureListAnalysis).setProcessing(undefined);
                }
            }
        });

        return reactionDisposer;
    }, []);
    if (!processing) {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No data' />;
    }
    return <DatasetVectorFeatureListTable processing={processing} />;
};

DatasetAnalysisWidgetFactory.register(DATASET_VECTOR_FEATURE_LIST_PROCESSING, (config: DatasetAnalysisWidgetFactoryConfig) => {
    return <DatasetVectorFeatureListAnalysisWidget {...config} />;
});
