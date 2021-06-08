import React, { useState } from 'react';

import { LoadingState, MapCoordQuantity } from '@oida/core';
import { MapRastersPointInfo, MAP_RASTERS_POINT_INFO } from '@oida/eo-mobx';
import { useFormatter, useSelector } from '@oida/ui-react-mobx';

import { DatasetAnalysisWidgetFactory, DatasetAnalysisWidgetFactoryConfig } from '../dataset-analysis-widget-factory';
import { observer } from 'mobx-react';
import { Collapse, Badge } from 'antd';
import { DatasetRasterPointInfoTable } from './dataset-raster-point-info-table';


export type MapRastersPointInfoWidgetProps = Omit<DatasetAnalysisWidgetFactoryConfig, 'combinedAnalysis'> & {
    combinedAnalysis: MapRastersPointInfo
};

const MapRastersPointInfoWidget = observer((props: MapRastersPointInfoWidgetProps) => {

    const [collapsedDatasets, setCollapsedDatasets] = useState<Record<string, boolean>>({});

    const coordFormatter = useFormatter(MapCoordQuantity);

    const rastersData = props.combinedAnalysis.analyses.filter((analysis) => {
        return analysis.loadingState.value === LoadingState.Loading || analysis.data !== undefined;
    }).map((analysis) => {
        return (
            <Collapse.Panel
                key={analysis.id}
                header={<Badge
                    color={analysis.dataset.config.color}
                    text={analysis.dataset.config.name}
                    title={analysis.dataset.config.name}
                />}
            >
                <DatasetRasterPointInfoTable pointInfo={analysis}/>
            </Collapse.Panel>
        );
    });
    const location = props.combinedAnalysis.location;

    const activePanes = props.combinedAnalysis.analyses
        .filter((analysis) => !collapsedDatasets[analysis.id])
        .map((analysis) => analysis.id);

    return (
        <div className='map-raster-point-info'>
            {location &&
                <div className='map-raster-point-info-location'>Lat: {coordFormatter(location.lat, {
                    coordType: 'lat'
                })} Lon: {coordFormatter(location.lon, {
                    coordType: 'lon'
                })}</div>
            }
            {!rastersData.length &&
                <div>No data</div>
            }
            <Collapse
                activeKey={activePanes}
                expandIconPosition='right'
                onChange={(expandedKeys) => {
                const collpasedUpdated = props.combinedAnalysis.analyses.reduce((collapsed, analysis) => {
                    if (expandedKeys.indexOf(analysis.id) === -1) {
                        return {
                            ...collapsed,
                            [analysis.id]: true
                        };
                    } else {
                        return collapsed;
                    }
                }, {});

                setCollapsedDatasets(collpasedUpdated);
            }}>
                {rastersData}
            </Collapse>
        </div>
    );
});

DatasetAnalysisWidgetFactory.register(MAP_RASTERS_POINT_INFO, (config: DatasetAnalysisWidgetFactoryConfig) => {

    const {combinedAnalysis, ...other} = config;
    return (
        <MapRastersPointInfoWidget
            combinedAnalysis={combinedAnalysis as MapRastersPointInfo}
            {...other}
        />
    );
});
