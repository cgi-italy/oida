import React from 'react';
import { autorun } from 'mobx';
import { useObserver } from 'mobx-react';

import { Checkbox, message } from 'antd';

import { AnyFormFieldDefinition, AoiAction } from '@oida/core';
import {
    useCenterOnMapFromModule, useMapAoiFieldFromModule, useDataFiltering
} from '@oida/ui-react-mst';
import { DatasetConfig, IDataset, IDatasetsExplorer, IDatasetDiscovery } from '@oida/eo';
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
                        datasetConfig.timeDistribution!.provider.getTimeExtent(
                            datasetView.dataset.searchParams.data.filters
                        ).then((range) => {
                            if (range) {
                                explorerState.timeExplorer.visibleRange.makeRangeVisible(
                                    new Date(range.start), new Date(range.end!), 0.1, true
                                );
                            }
                        }).catch((e) => {
                            message.error(`Unable to get time range for dataset ${datasetConfig.name}: ${e}`);
                        });

                        if (datasetConfig.spatialCoverageProvider) {
                            datasetConfig.spatialCoverageProvider().then((extent) => {
                                centerOnMap({
                                    type: 'BBox',
                                    bbox: extent as GeoJSON.BBox
                                }, {animate: true, notIfInViewport: true});
                            });
                        }
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
        <div>
            {commmonFiltersProps &&
                <DataFilterer
                    {...commmonFiltersProps}
                />
            }
            <div>
                {datasetFilters}
            </div>
        </div>
    );
};


DatasetExplorerQuery.defaultProps = {
    filters: [
        {
            type: 'aoi',
            name: 'aoi',
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
            type: 'daterange',
            name: 'time',
            title: 'Time range',
            config: {
                withTime: false
            }
        }
    ]
};
