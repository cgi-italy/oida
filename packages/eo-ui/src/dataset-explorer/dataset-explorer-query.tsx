import React from 'react';
import { autorun } from 'mobx';
import { useObserver } from 'mobx-react';

import { Checkbox, message } from 'antd';

import { AnyFormFieldDefinition, AOI_FIELD_ID, AoiAction, DATE_RANGE_FIELD_ID } from '@oida/core';
import {
    useCenterOnMapFromModule, useMapAoiFieldFromModule, useDataFiltering
} from '@oida/ui-react-mst';
import { DatasetConfig, IDataset, IDatasetsExplorer, IDatasetDiscovery, DATASET_AOI_FILTER_KEY, DATASET_TIME_RANGE_FILTER_KEY } from '@oida/eo';
import { DataFilterer } from '@oida/ui-react-antd';


export type DatasetFiltersProps = {
    dataset: IDataset;
};

export const DatasetFilters = ({dataset}: DatasetFiltersProps) => {

    let filteringProps = useDataFiltering({filters: dataset.config.filters, filteringState: dataset.searchParams.filters});
    if (filteringProps) {
        return <DataFilterer
            {...filteringProps}
        />;
    } else {
        return null;
    }
};

export type DatasetExplorerSelectionProps = {
    datasetConfig: DatasetConfig;
    explorerState: IDatasetsExplorer;
};

export const DatasetExplorerSelection = ({datasetConfig, explorerState}: DatasetExplorerSelectionProps) => {

    let datasetView = useObserver(() => {
        return explorerState.getDatasetView(datasetConfig.id);
    });

    let centerOnMap = useCenterOnMapFromModule();

    return (
        <div key={datasetConfig.id}>
            <Checkbox
                checked={datasetView !== undefined}
                onChange={(evt) => {
                    let checked = evt.target.checked;
                    if (checked) {
                        datasetView = explorerState.addDataset(datasetConfig);

                    } else {
                        explorerState.removeDataset(datasetConfig.id);
                    }
                }}
            >{datasetConfig.name}
            </Checkbox>
            {datasetView && <DatasetFilters dataset={datasetView.dataset}></DatasetFilters>}
        </div>
    );
};

export type DatasetExplorerQueryProps = {
    discoveryState: IDatasetDiscovery;
    explorerState: IDatasetsExplorer;
    filters?: AnyFormFieldDefinition[];
};

export const DatasetExplorerQuery = (props: DatasetExplorerQueryProps) => {

    let commmonFiltersProps = useDataFiltering({filters: props.filters!, filteringState: props.explorerState.commonFilters});


    let datasetFilters = useObserver(() => props.discoveryState.datasets.map((datasetConfig) => {

        return (
            <DatasetExplorerSelection
                key={datasetConfig.id}
                datasetConfig={datasetConfig}
                explorerState={props.explorerState}
            />
        );
    }));

    return (
        <div className='dataset-explorer-query'>
            {commmonFiltersProps &&
                <DataFilterer
                    {...commmonFiltersProps}
                />
            }
            <div className='dataset-filters'>
                {datasetFilters}
            </div>
        </div>
    );
};


DatasetExplorerQuery.defaultProps = {
    filters: [
        {
            type: AOI_FIELD_ID,
            name: DATASET_AOI_FILTER_KEY,
            title: 'Area of interest',
            config: (filterState) => {

                const supportedGeometries = [{
                    type: 'BBox'
                }, {
                    type: 'Polygon'
                }, {
                    type: 'MultiPolygon'
                }];

                let aoiFieldConfig = useMapAoiFieldFromModule({
                    ...filterState,
                    supportedGeometries
                });

                return {
                    supportedGeometries: supportedGeometries,
                    supportedActions: [AoiAction.DrawBBox, AoiAction.DrawPolygon, AoiAction.Import],
                    ...aoiFieldConfig
                };
            }
        },
        {
            type: DATE_RANGE_FIELD_ID,
            name: DATASET_TIME_RANGE_FILTER_KEY,
            title: 'Time range',
            config: {
                withTime: false
            }
        }
    ]
};
