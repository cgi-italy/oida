import React, { useEffect, useState, useMemo } from 'react';
import classnames from 'classnames';

import { autorun } from 'mobx';
import { useObserver } from 'mobx-react';
import { addDisposer } from 'mobx-state-tree';

import { EChartOption } from 'echarts/lib/echarts';

import { VerticalProfileCoordinate } from '@oida/core';

import { IDatasetAnalysis, IDatasetVerticalProfileViz, IDatasetVerticalProfile, VERTICAL_PROFILE_VIZ_TYPE } from '@oida/eo';
import { useCenterOnMapFromModule } from '@oida/ui-react-mst';

import { ChartWidget } from './chart-widget';
import { UnprojectedImageLayer } from './unprojected-image-layer';

import { DatasetAnalysisWidgetFactory } from './dataset-analysis-widget-factory';


export type VerticalProfileImageProps = {
    verticalProfileViz: IDatasetVerticalProfileViz;
    selectedProfile: IDatasetVerticalProfile;
    highlightedCoord?: GeoJSON.Position;
    selectedCoord?: GeoJSON.Position;
    style: {
        horizontalSeriesColor: string,
        verticalSeriesColor: string,
        highlightCoordColor: string,
        selectedCoordColor: string
    }
};

export const VerticalProfileImage = (props: VerticalProfileImageProps) => {

    let [sourceConfig, setSourceConfig] = useState();

    let vProfileViz = props.verticalProfileViz;

    const tileSourceProvider = props.verticalProfileViz.config.tileSourceProvider;

    const sourceRevision = useObserver(() => vProfileViz.tileSourceRevision);

    useEffect(() => {
        let sourceUpdateDisposer = autorun(() => {
            if (tileSourceProvider) {
                tileSourceProvider(vProfileViz, props.selectedProfile.id).then(source => {
                    setSourceConfig(source);
                });
            }
        });

        return () => {
            sourceUpdateDisposer();
        };

    }, []);


    let centerOnMap = useCenterOnMapFromModule();

    const getGeographicCoord = (coord) => {

        if (!coord || !vProfileViz.config.profileCoordTransform) {
            return Promise.resolve(undefined);
        } else {
            return vProfileViz.config.profileCoordTransform.forward(props.selectedProfile.id, coord).then(
                (geographicCoord) => {
                    if (geographicCoord) {
                        geographicCoord[2] *= vProfileViz.verticalScale;
                    }
                    return geographicCoord;
                }
            );
        }
    };

    const onMouseCoord = (coord) => {
        getGeographicCoord(coord).then((geographicCoord) => {
            vProfileViz.mapLayer?.setHighlihgtedCoordinate({
                profileId: props.selectedProfile.id,
                geographic: geographicCoord,
                unprojected: coord
            });
        });
    };

    const onMouseClick = (coord) => {
        getGeographicCoord(coord).then((geographicCoord) => {
            vProfileViz.mapLayer?.setSelectedCoordinate({
                profileId: props.selectedProfile.id,
                geographic: geographicCoord,
                unprojected: coord
            });
            if (geographicCoord) {
                centerOnMap({type: 'Point', coordinates: geographicCoord}, {
                    animate: true
                });
            }
        });
    };

    return (
        <UnprojectedImageLayer
            sourceConfig={sourceConfig}
            sourceRevision={sourceRevision}
            onMouseCoord={onMouseCoord}
            onMouseClick={onMouseClick}
            highlightedCoord={props.highlightedCoord}
            selectedCoord={props.selectedCoord}
            style={props.style}
        />
    );
};

export type VerticalProfileSeriesProps = {
    verticalProfileViz: IDatasetVerticalProfileViz;
    selectedProfile: IDatasetVerticalProfile;
    direction: 'horizontal' | 'vertical';
    coordIndex?: number;
    highlightedCoord?: GeoJSON.Position;
    selectedCoord?: GeoJSON.Position;
    selectColor: string;
    color: string;
    highlightColor: string;
};

export const VerticalProfileSeries = (props: VerticalProfileSeriesProps) => {

    const [series, setSeries] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [tipOptions, setTipOptions] = useState();
    const [trackCoordinate, setTrackCoordinate] = useState(false);

    const getGeographicCoord = (coord) => {

        if (!coord || !props.verticalProfileViz.config.profileCoordTransform) {
            return Promise.resolve(undefined);
        } else {
            return props.verticalProfileViz.config.profileCoordTransform.forward(props.selectedProfile.id, coord).then(
                (geographicCoord) => {
                    if (geographicCoord) {
                        geographicCoord[2] *= props.verticalProfileViz.verticalScale;
                    }
                    return geographicCoord;
                }
            );
        }
    };

    let centerOnMap = useCenterOnMapFromModule();

    useEffect(() => {
        if (props.coordIndex !== undefined) {
            setIsLoading(true);
            props.verticalProfileViz.config.lineSeriesProvider!({
                profileId: props.selectedProfile.id,
                direction: props.direction,
                coordIndex: props.coordIndex
            }).then((response) => {
                setSeries({
                    chartData: response.data.map((item) => [item.x / 1000, item.y]),
                    imageData: response.data.map(item => [item.imageCoord.x, item.imageCoord.y]),
                    subsample: response.subsample
                });
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
            setSeries(undefined);
        }
    }, [props.selectedProfile, props.direction, props.coordIndex]);

    let variableConfig = useMemo(() => {
        let variables = props.verticalProfileViz.config.colorMapConfig!.variables;

        let variableConfig;
        if (Array.isArray(variables)) {
            variableConfig = variables.find((variable) => {
                return variable.id === props.verticalProfileViz.colorMap!.variable;
            });
        } else {
            variableConfig = variables;
        }
        return variableConfig;
    }, []);

    /*
    useEffect(() => {
        //only when mouse is not over the chart area
        if (trackCoordinate) {
            return;
        }
        let tipOptions;

        //TODO: this doesn't take into account no data values -> Fix
        if (series && props.highlightedCoord) {
            if (props.direction === 'horizontal') {
                if (props.highlightedCoord[1] === props.coordIndex) {
                    tipOptions = {
                        seriesIndex: 0,
                        dataIndex: Math.round(props.highlightedCoord[0] * series.subsample)
                    };
                }
            } else {
                if (props.highlightedCoord[0] === props.coordIndex) {
                    tipOptions = {
                        seriesIndex: 0,
                        dataIndex: Math.round(props.highlightedCoord[1] * series.subsample)
                    };
                }
            }
        }
        setTipOptions(tipOptions);
    }, [props.highlightedCoord, trackCoordinate]);
    */

    let chartOptions: EChartOption = useMemo(() => {

        let selectedDataIdx;
        if (props.selectedCoord && series) {
            selectedDataIdx = Math.round(props.direction === 'horizontal'
                ? props.selectedCoord[0] * series.subsample
                : props.selectedCoord[1] * series.subsample);
        }
        return {
            title: {
                top: '0px',
                left: '0px',
                text: `${props.direction === 'horizontal' ? 'Horizontal' : 'Vertical'} trend`,
                textStyle: {
                    color: '#FFF'
                }
            },
            color: [props.color],
            legend: {
                show: false,
                data: [variableConfig.name],
                right: '10px'
            },
            tooltip: {
                trigger: 'axis',
                transitionDuration: 0,
                formatter: (params, ticket, callback) => {
                    const fParams = params[0]! as EChartOption.Tooltip.Format;
                    if (fParams.value) {
                        if (trackCoordinate) {
                            //hack: we use the tooltip formatter as a chart point highlight event emitter
                            if (fParams.dataIndex !== undefined) {

                                getGeographicCoord(series.imageData[fParams.dataIndex]).then(geographicCoord => {
                                    props.verticalProfileViz.mapLayer?.setHighlihgtedCoordinate({
                                        profileId: props.selectedProfile.id,
                                        unprojected: series.imageData[fParams.dataIndex!],
                                        geographic: geographicCoord
                                    });

                                    if (props.direction === 'horizontal' && geographicCoord) {
                                        let lon = geographicCoord[0];
                                        if (geographicCoord[0] > 180) {
                                            lon = geographicCoord[0] - 360;
                                        }
                                        callback(ticket, `
                                            <div>
                                                <span>Lon: </span><span>${lon.toFixed(2)}</span>
                                                <span>Lat: </span><span>${geographicCoord[1].toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span>${variableConfig.name}${variableConfig.units ? (' (' + variableConfig.units + ')') : ''}: </span>
                                                <span>${fParams.value![1].toFixed(2)}</span>
                                            </div>
                                        `);
                                    }
                                });
                            }
                        }

                        return `
                            <div><span>${props.direction === 'horizontal' ? 'Distance (km)' : 'Height (m)'}: </span>${fParams.value[0].toFixed(0)}</div>
                            <div><span>${variableConfig.name}${variableConfig.units ? (' (' + variableConfig.units + ')') : ''}: </span><span>${fParams.value[1].toFixed(2)}</span></div>
                        `;
                    } else {
                        return '';
                    }
                },
                axisPointer: {
                    type: 'line',
                    snap: true,
                    lineStyle: {
                        opacity: 0
                    }
                }
            },
            xAxis: [{
                type: 'value',
                name: props.direction === 'horizontal' ? 'Distance (km)' : 'Height (m)',
                nameLocation: 'middle',
                nameGap: 30
            }],
            yAxis: [{
                type: 'value',
                name: variableConfig.name,
                nameRotate: 90,
                nameLocation: 'middle',
                nameGap: 60
            }],
            grid: {
                left: 40,
                right: 20,
                bottom: 30,
                top: 20,
                containLabel: true
            },
            series: [{
                type: 'line',
                name: variableConfig.name,
                yAxisIndex: 0,
                smooth: true,
                // @ts-ignore
                data: series ? series.chartData : undefined,
                emphasis: {
                    itemStyle: {
                        color: props.highlightColor
                    }
                },
                markPoint: series ? {
                    data: [{
                        coord: series.chartData[selectedDataIdx]
                    }],
                    itemStyle: {
                        color: '#FFFF00',
                        borderWidth: 1,
                        borderColor: '#000'
                    }
                } : undefined,
            }],
            backgroundColor: 'transparent'
        };
    }, [series, trackCoordinate]);

    return <ChartWidget
        options={chartOptions}
        showTip={tipOptions}
        isLoading={isLoading}
        onMouseEnter={() => setTrackCoordinate(true)}
        onMouseLeave={() => setTrackCoordinate(false)}
        onItemClick={(evt) => {
            if (evt.dataIndex && props.selectedCoord) {
                getGeographicCoord(series.imageData[evt.dataIndex]).then(geographicCoord => {
                    props.verticalProfileViz.mapLayer?.setSelectedCoordinate({
                        profileId: props.selectedProfile.id,
                        unprojected: series.imageData[evt.dataIndex],
                        geographic: geographicCoord
                    });

                    if (geographicCoord) {
                        centerOnMap({type: 'Point', coordinates: geographicCoord}, {
                            animate: true
                        });
                    }
                });
            }
        }}
    />;
};

export type VerticalProfileVizWidgetProps = {
    verticalProfileViz: IDatasetVerticalProfileViz;
    style?: {
        horizontalSeriesColor: string,
        verticalSeriesColor: string,
        highlightCoordColor: string,
        selectedCoordColor: string
    }
};

export const VerticalProfileVizWidget = (props: VerticalProfileVizWidgetProps) => {

    let [highlightedCoord, setHighlightedCoord] = useState<GeoJSON.Position | undefined>();
    let [selectedCoord, setSelectedCoord] = useState<GeoJSON.Position | undefined>();

    const selectedProfile = useObserver(() => props.verticalProfileViz.verticalProfiles.items.find(profile => profile.selected));

    let vProfileViz = props.verticalProfileViz;
    const transform = vProfileViz.config.profileCoordTransform;


    const getImageCoord = (profileCoord) => {
        if (profileCoord && selectedProfile && selectedProfile.id === profileCoord.profileId) {
            if (profileCoord.unprojected) {
                return Promise.resolve(profileCoord.unprojected);
            } else if (profileCoord.geographic && transform) {
                let coord = [...profileCoord.geographic];
                coord[2] /= vProfileViz.verticalScale;
                return transform.inverse(selectedProfile.id, coord);
            }
        }

        return Promise.resolve(undefined);
    };

    useEffect(() => {
        const hoverCoordDisposer = autorun(() => {
            getImageCoord(vProfileViz.mapLayer?.highlightedCoordinate).then((imageCoord) => {
                setHighlightedCoord(imageCoord);
            });
        });

        const selectCoordDisposer = autorun(() => {
            getImageCoord(vProfileViz.mapLayer?.selectedCoordinate).then((imageCoord) => {
                setSelectedCoord(imageCoord);
            });
        });

        return () => {
            vProfileViz.mapLayer?.setSelectedCoordinate(undefined);
            vProfileViz.mapLayer?.setHighlihgtedCoordinate(undefined);
            vProfileViz.mapLayer?.setHighlightedRegion(undefined);
            selectedProfile?.setSelected(false);
            hoverCoordDisposer();
            selectCoordDisposer();
        };

    }, []);

    if (!selectedProfile) {
        return null;
    }

    return (
        <div className={classnames('dataset-vertical-profile-chart', {'is-coord-selected': !!selectedCoord})}>
            <VerticalProfileImage
                verticalProfileViz={props.verticalProfileViz}
                selectedProfile={selectedProfile}
                highlightedCoord={highlightedCoord}
                selectedCoord={selectedCoord}
                style={props.style!}
            />
            <div className='line-series-chart'>
                <VerticalProfileSeries
                    verticalProfileViz={props.verticalProfileViz}
                    selectedProfile={selectedProfile}
                    direction='horizontal'
                    coordIndex={selectedCoord ? selectedCoord[1] : undefined}
                    highlightedCoord={highlightedCoord}
                    selectedCoord={selectedCoord}
                    selectColor={props.style!.selectedCoordColor}
                    highlightColor={props.style!.highlightCoordColor}
                    color={props.style!.horizontalSeriesColor}
                />
                <VerticalProfileSeries
                    verticalProfileViz={props.verticalProfileViz}
                    selectedProfile={selectedProfile}
                    direction='vertical'
                    coordIndex={selectedCoord ? selectedCoord[0] : undefined}
                    highlightedCoord={highlightedCoord}
                    selectedCoord={selectedCoord}
                    selectColor={props.style!.selectedCoordColor}
                    highlightColor={props.style!.highlightCoordColor}
                    color={props.style!.verticalSeriesColor}
                />
            </div>
        </div>
    );
};


VerticalProfileVizWidget.defaultProps = {
    style: {
        horizontalSeriesColor: 'red',
        verticalSeriesColor: 'blue',
        highlightCoordColor: 'orange',
        selectedCoordColor: 'yellow'
    }
};

DatasetAnalysisWidgetFactory.register(VERTICAL_PROFILE_VIZ_TYPE, (config) => {

    let analysis = config.analysis as IDatasetAnalysis;
    let verticalProfileViz = analysis.datasetViz as IDatasetVerticalProfileViz;

    if (!verticalProfileViz.config.tileSourceProvider) {
        return undefined;
    }

    let visibilityUpdateDisposer = autorun(() => {
        let selectedProfile = verticalProfileViz.verticalProfiles.items.find((profile) => profile.selected);
        if (!selectedProfile) {
            analysis.setVisible(false);
        } else {
            analysis.setVisible(true);
        }
    });

    addDisposer(analysis, visibilityUpdateDisposer);

    return <VerticalProfileVizWidget
        verticalProfileViz={verticalProfileViz}
    />;
});
