import { autorun } from 'mobx';

import nearestPointOnLine from '@turf/nearest-point-on-line';

import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { VERTICAL_PROFILE_VIZ_TYPE, DatasetVerticalProfileViz, VerticalProfileVizConfig, RasterBandModeType, DatasetMapViewConfig } from  '@oidajs/eo-mobx';

import { AdamDatasetConfig, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';

import { createVerticalProfileDataProvider } from './create-vertical-profile-data-provider';
import { createAdamVerticalProfileTileSourceProvider } from './create-vertical-profile-tilesource-provider';
import { getPlottyColorScales } from '@oidajs/eo-geotiff';

export const getAdamVerticalProfileViewConfig = (
    axiosInstance: AxiosInstanceWithCancellation,
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamDatasetConfig
) => {

    if (datasetConfig.type !== 'vertical_profile') {
        return;
    }

    const {verticalProfileProvider, geotiffLoader, wcsProvider} =
        createVerticalProfileDataProvider(factoryConfig, datasetConfig, axiosInstance);

    const {tileSourceProvider, geotiffLoader: tileGeotiffLoader } =
        createAdamVerticalProfileTileSourceProvider(factoryConfig, datasetConfig, axiosInstance, wcsProvider);

    const afterInit = (mapViz: DatasetVerticalProfileViz) => {

        let renderer = geotiffLoader.renderer;
        let tileRenderer = tileGeotiffLoader.renderer;
        autorun(() => {
            const bandMode = mapViz.bandMode.value;
            if (bandMode?.type === RasterBandModeType.Single) {
                renderer.setColorScale(bandMode.colorMap.colorScale);
                tileRenderer.setColorScale(bandMode.colorMap.colorScale);
                const domain = bandMode.colorMap.domain;
                if (domain) {
                    renderer.setDomain([domain.mapRange.min, domain.mapRange.max]);
                    renderer.setClamp(domain.clamp);
                    renderer.setNoDataValue(domain.noDataValue);

                    tileRenderer.setDomain([domain.mapRange.min, domain.mapRange.max]);
                    tileRenderer.setClamp(domain.clamp);
                    tileRenderer.setNoDataValue(domain.noDataValue);
                }
                mapViz.refreshData();
                mapViz.refreshTileView();

            }
        });
    };

    const profileCoordTransform = {
        forward: (profileId, profileCoord) => {
            return wcsProvider.getProfileMetadata(profileId).then(profile => {
                let length = profile.dimensions[1];
                let ratio = profileCoord[0] / length;

                if (ratio > 1 || ratio < 0) {
                    return;
                }

                let gcps = profile.gcps;

                let startIdx = Math.round(gcps.length * ratio);
                let i = startIdx;

                let geographicCoord;

                if (profileCoord[0] < gcps[startIdx].L) {
                    for (i = startIdx;  i > 0; --i) {
                        if (profileCoord[0] >= gcps[i].L) {
                            break;
                        }
                    }
                } else {
                    for (i = startIdx; i < gcps.length - 1; ++i) {
                        if (profileCoord[0] <= gcps[i].L) {
                            break;
                        }
                    }
                }
                //TODO: linear interp
                geographicCoord = [gcps[i].X, gcps[i].Y];
                if (datasetConfig.requestExtentOffset) {
                    geographicCoord[0] -= datasetConfig.requestExtentOffset[0];
                    geographicCoord[1] -= datasetConfig.requestExtentOffset[1];
                }

                let height = profileCoord[1] * profile.metadata.VERTICAL_MAX / profile.dimensions[0];

                return [...geographicCoord, height];
            });
        },
        inverse: (profileId, geographicCoord) => {
            return wcsProvider.getProfileMetadata(profileId).then(profile => {
                let nearestPoint = nearestPointOnLine(
                    profile.track,
                    [geographicCoord[0], geographicCoord[1]]
                );

                let x = profile.gcps[nearestPoint.properties.index].L;
                let y = geographicCoord[2] * profile.dimensions[0] / profile.metadata.VERTICAL_MAX;

                return [x, y];
            });
        }
    };

    if (isMultiBandCoverage(datasetConfig.coverages)) {
        return undefined;
    }

    const colorScales = getPlottyColorScales();

    const vizConfig: VerticalProfileVizConfig = {
        bandMode: {
            supportedModes: [{
                type: RasterBandModeType.Single,
                default: {
                    band: datasetConfig.coverages[0].id
                }
            }],
            bands: datasetConfig.coverages.map(coverage => {
                return {
                    colorScales: colorScales,
                    ...coverage
                };
            }),
            defaultMode: 0
        },
        dataProvider: verticalProfileProvider,
        tileSourceProvider: tileSourceProvider,
        profileCoordTransform: profileCoordTransform,
        lineSeriesProvider: (request) => {
            return wcsProvider.getProfileLineSeries({
                profileId: request.profileId,
                targetSamples: 100,
                series: {
                    direction: request.direction,
                    index: request.coordIndex
                }
            });
        },
        verticalScaleConfig: {
            min: 20,
            max: 100,
            step: 1,
            default: 50
        },
        afterInit: afterInit
    };

    return {
        type: VERTICAL_PROFILE_VIZ_TYPE,
        config: vizConfig
    } as DatasetMapViewConfig<typeof VERTICAL_PROFILE_VIZ_TYPE>;

};
