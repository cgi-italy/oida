import React, { useState } from 'react';

import { LoadingState, MapCoordQuantity } from '@oidajs/core';
import { MapRastersPointInfo, MAP_RASTERS_POINT_INFO_ANALYSIS } from '@oidajs/eo-mobx';
import { useFormatter } from '@oidajs/ui-react-mobx';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { observer } from 'mobx-react';
import { Collapse, Badge } from 'antd';
import { DatasetRasterPointInfoTable } from './dataset-raster-point-info-table';

export type MapRastersPointInfoWidgetProps = Omit<DatasetAnalysisWidgetFactoryConfig, 'combinedAnalysis'> & {
    combinedAnalysis: MapRastersPointInfo;
};

const MapRastersPointInfoWidget = observer((props: MapRastersPointInfoWidgetProps) => {
    const [collapsedDatasets, setCollapsedDatasets] = useState<Record<string, boolean>>({});

    const coordFormatter = useFormatter(MapCoordQuantity);

    const rastersData = props.combinedAnalysis.processings
        .filter((processing) => {
            return (
                processing.loadingState.value === LoadingState.Loading ||
                processing.loadingState.value === LoadingState.Error ||
                processing.data !== undefined
            );
        })
        .map((analysis) => {
            return (
                <Collapse.Panel
                    key={analysis.id}
                    header={
                        <Badge
                            color={analysis.dataset.config.color}
                            text={analysis.dataset.config.name}
                            title={analysis.dataset.config.name}
                        />
                    }
                >
                    <DatasetRasterPointInfoTable pointInfo={analysis} />
                </Collapse.Panel>
            );
        });
    const location = props.combinedAnalysis.location;

    const activePanes = props.combinedAnalysis.processings
        .filter((processing) => !collapsedDatasets[processing.id])
        .map((processing) => processing.id);

    return (
        <div className='map-raster-point-info'>
            {location && (
                <div className='map-raster-point-info-location'>
                    Lat:{' '}
                    {coordFormatter(location.lat, {
                        coordType: 'lat'
                    })}{' '}
                    Lon:{' '}
                    {coordFormatter(location.lon, {
                        coordType: 'lon'
                    })}
                </div>
            )}
            {!rastersData.length && <div>No data</div>}
            <Collapse
                activeKey={activePanes}
                expandIconPosition='end'
                onChange={(expandedKeys) => {
                    const collpasedUpdated = props.combinedAnalysis.processings.reduce((collapsed, processing) => {
                        if (expandedKeys.indexOf(processing.id) === -1) {
                            return {
                                ...collapsed,
                                [processing.id]: true
                            };
                        } else {
                            return collapsed;
                        }
                    }, {});

                    setCollapsedDatasets(collpasedUpdated);
                }}
            >
                {rastersData}
            </Collapse>
        </div>
    );
});

DatasetAnalysisWidgetFactory.register(MAP_RASTERS_POINT_INFO_ANALYSIS, (config: DatasetAnalysisWidgetFactoryConfig) => {
    const { combinedAnalysis, ...other } = config;
    return <MapRastersPointInfoWidget combinedAnalysis={combinedAnalysis as MapRastersPointInfo} {...other} />;
});
