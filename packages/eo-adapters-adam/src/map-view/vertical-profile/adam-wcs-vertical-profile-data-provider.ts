import { AxiosInstanceWithCancellation, createAxiosInstance, DateRangeValue } from '@oidajs/core';

import { AdamServiceParamsSerializer, getWcsTimeFilterSubset } from '../../utils';

export type AdamWcsVerticalProfileDataProviderConfig = {
    serviceUrl: string;
    axiosInstance?: AxiosInstanceWithCancellation;
};

export type AdamWcsVerticalProfile = {
    time: Date;
    dimensions: number[];
    gcps: Array<{
        P: number;
        L: number;
        X: number;
        Y: number;
        Z: number;
    }>;
    track: GeoJSON.LineString;
    metadata: {
        HORIZONTAL_LENGTH: number;
        HORIZONTAL_RES: number;
        UNIT: string;
        VERTICAL_MAX: number;
        VERTICAL_MIN: number;
        VERTICAL_RES: number;
    };
    noDataValue: number;
    coverageId: string;
    dimensionSubsets?: string[];
};

export type AdamWcsVerticalProfilesRequest = {
    wcsCoverage: string;
    timeFilter?: Date | DateRangeValue;
    scale?: number;
    xSubset?: number[];
    ySubset?: number[];
    geometryOffset?: number[];
    dimensionSubsets?: string[];
};

export type AdamWcsVerticalProfileDataRequest = {
    profileId: string;
    xSubset?: number[];
    ySubset?: number[];
};

export type AdamWcsVerticalProfileSeriesRequest = {
    profileId: string;
    targetSamples?: number;
    series: {
        direction: 'horizontal' | 'vertical';
        index: number;
    };
};

export class AdamWcsVerticalProfileDataProvider {
    protected config_: AdamWcsVerticalProfileDataProviderConfig;
    protected coverageProfiles_: {
        [coverageId: string]: Promise<{ [profileId: string]: AdamWcsVerticalProfile }>;
    };

    protected cachedProfiles_: {
        [profileId: string]: AdamWcsVerticalProfile;
    };

    protected axiosInstance_: AxiosInstanceWithCancellation;

    constructor(config: AdamWcsVerticalProfileDataProviderConfig) {
        this.config_ = config;
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.coverageProfiles_ = {};
        this.cachedProfiles_ = {};
    }

    getProfiles(request: AdamWcsVerticalProfilesRequest) {
        const wcsParams: any = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            coverageId: request.wcsCoverage,
            format: 'image/tiff'
        };

        const subset = request.dimensionSubsets?.slice() || [];

        if (request.xSubset) {
            subset.push(`x(${request.xSubset[0]},${request.xSubset[1]}`);
        }
        if (request.ySubset) {
            subset.push(`y(${request.ySubset[0]},${request.ySubset[1]}`);
        }

        return this.getProfilesMetadata_(request).then((profiles) => {
            return Object.keys(profiles).map((profileId) => {
                const profileInfo = profiles[profileId];
                const timeSubset = `unix(${profileInfo.time.toISOString()})`;

                const desiredHorizontalRes = 4000;
                if (profileInfo.dimensions[1] > desiredHorizontalRes) {
                    wcsParams.scale = desiredHorizontalRes / profileInfo.dimensions[1];
                }

                return {
                    id: profileId,
                    ...profileInfo,
                    dataUrl: `${this.config_.serviceUrl}?${AdamServiceParamsSerializer({
                        ...wcsParams,
                        subset: [...subset, timeSubset]
                    })}`
                };
            });
        });
    }

    getProfileDataUrl(request: AdamWcsVerticalProfileDataRequest) {
        return this.getProfileMetadata(request.profileId).then((profile) => {
            const wcsParams: any = {
                service: 'WCS',
                request: 'GetCoverage',
                version: '2.0.0',
                coverageId: profile.coverageId,
                format: 'image/tiff'
            };

            const subset: string[] = profile.dimensionSubsets?.slice() || [];

            if (request.xSubset) {
                subset.push(`x(${request.xSubset[0]},${request.xSubset[1]}`);
            }
            if (request.ySubset) {
                subset.push(`y(${request.ySubset[0]},${request.ySubset[1]}`);
            }

            const timeSubset = `unix(${profile.time.toISOString()})`;

            const desiredHorizontalRes = 4000;
            if (profile.dimensions[1] > desiredHorizontalRes) {
                wcsParams.scale = desiredHorizontalRes / profile.dimensions[1];
            }

            return `${this.config_.serviceUrl}?${AdamServiceParamsSerializer({
                ...wcsParams,
                subset: [...subset, timeSubset]
            })}`;
        });
    }

    getProfileLineSeries(request: AdamWcsVerticalProfileSeriesRequest) {
        return this.getProfileMetadata(request.profileId).then((profile) => {
            const wcsParams: any = {
                service: 'WCS',
                request: 'GetCoverage',
                version: '2.0.0',
                coverageId: profile.coverageId,
                format: 'application/json'
            };

            const subset: string[] = profile.dimensionSubsets?.slice() || [];

            const index = Math.round(request.series.index);

            const targetSamples = request.targetSamples || 100;

            if (request.series.direction === 'horizontal') {
                subset.push(`x(${index},${index + 1})`);
                wcsParams.scale = targetSamples / profile.dimensions[1];
            } else {
                subset.push(`y(${index},${index + 1})`);
                wcsParams.scale = targetSamples / profile.dimensions[0];
            }

            subset.push(`unix(${profile.time.toISOString()})`);

            return this.axiosInstance_
                .cancelableRequest({
                    url: this.config_.serviceUrl,
                    method: 'GET',
                    params: {
                        ...wcsParams,
                        subset: subset
                    },
                    paramsSerializer: {
                        serialize: AdamServiceParamsSerializer
                    }
                })
                .then((response) => {
                    let series;
                    if (request.series.direction === 'horizontal') {
                        series = response.data.data[0].raster[0].map((value, idx) => {
                            return {
                                x: this.getDistanceFromHorizontalCoord_(profile, idx, wcsParams.scale),
                                y: value[0],
                                imageCoord: {
                                    x: idx / (wcsParams.scale || 1),
                                    y: index
                                }
                            };
                        });
                    } else {
                        series = response.data.data[0].raster[0][0].map((value, idx) => {
                            return {
                                x: this.getHeightFromVerticalCoord_(profile, idx, wcsParams.scale),
                                y: value,
                                imageCoord: {
                                    x: index,
                                    y: idx / (wcsParams.scale || 1)
                                }
                            };
                        });
                    }
                    return {
                        data: series.filter((value) => value.y !== profile.noDataValue),
                        subsample: wcsParams.scale || 1
                    };
                });
        });
    }

    getProfileMetadata(profileId: string) {
        return Promise.resolve(this.cachedProfiles_[profileId]);
    }

    protected getHeightFromVerticalCoord_(profile: AdamWcsVerticalProfile, coordIndex: number, scale?: number) {
        const absoluteIdx = coordIndex / (scale || 1);
        return (
            profile.metadata.VERTICAL_MIN +
            (absoluteIdx / profile.dimensions[0]) * (profile.metadata.VERTICAL_MAX - profile.metadata.VERTICAL_MIN)
        );
    }

    protected getDistanceFromHorizontalCoord_(profile: AdamWcsVerticalProfile, coordIndex: number, scale?: number) {
        const absoluteIdx = coordIndex / (scale || 1);
        return absoluteIdx * profile.metadata.HORIZONTAL_RES;
    }

    protected getProfilesMetadata_(request: AdamWcsVerticalProfilesRequest) {
        const { wcsCoverage, geometryOffset, timeFilter, dimensionSubsets } = request;

        const subsets = dimensionSubsets?.slice() || [];

        const timeFilterSubset = getWcsTimeFilterSubset(timeFilter);
        if (timeFilterSubset) {
            subsets.push(timeFilterSubset);
        }

        const wcsParams: any = {
            service: 'WCS',
            request: 'GetInfo',
            version: '2.0.0',
            subset: subsets,
            coverageId: wcsCoverage
        };

        return this.axiosInstance_
            .cancelableRequest({
                url: this.config_.serviceUrl,
                method: 'GET',
                params: wcsParams,
                paramsSerializer: {
                    serialize: AdamServiceParamsSerializer
                }
            })
            .then((response) => {
                const profiles: AdamWcsVerticalProfile[] = response.data.prods.map((prod) =>
                    this.parseProfileMetadata_(prod, wcsCoverage, geometryOffset, dimensionSubsets)
                );
                const profilesMap: { [profileId: string]: AdamWcsVerticalProfile } = profiles.reduce((profileMap, profile) => {
                    let profileId = `${wcsCoverage}_${profile.time.getTime()}`;
                    if (dimensionSubsets) {
                        profileId += `_${request.dimensionSubsets?.join('_')}`;
                    }
                    return {
                        ...profileMap,
                        [profileId]: profile
                    };
                }, {});

                this.cachedProfiles_ = {
                    ...this.cachedProfiles_,
                    ...profilesMap
                };

                return profilesMap;
            });
    }

    protected parseProfileMetadata_(data, coverageId: string, geometryOffset?: number[], dimensionSubsets?: string[]) {
        const horizontalLength = parseFloat(data.metadata.HORIZONTAL_LEGHT);
        const horizontalRes = data.metadata.HORIZONTAL_RES
            ? parseFloat(data.metadata.HORIZONTAL_RES)
            : horizontalLength / data.dimentions[1];

        const verticalMin = parseFloat(data.metadata.VERTICAL_MIN);
        const verticalMax = parseFloat(data.metadata.VERTICAL_MAX);
        const verticalRes = data.metadata.VERTICAL_RES
            ? parseFloat(data.metadata.VERTICAL_RES)
            : (verticalMax - verticalMin) / data.dimentions[0];

        return {
            time: new Date(data.time * 1000),
            dimensions: data.dimentions,
            gcps: data.gcps,
            metadata: {
                HORIZONTAL_LENGTH: horizontalLength,
                HORIZONTAL_RES: horizontalRes,
                UNIT: data.UNIT,
                VERTICAL_MAX: verticalMax,
                VERTICAL_MIN: verticalMin,
                VERTICAL_RES: verticalRes
            },
            noDataValue: data.bands[0].nodata,
            track: {
                type: 'LineString',
                coordinates: data.gcps
                    .sort((a, b) => a.L - b.L)
                    .map((gcp) => {
                        const coord = [gcp.X, gcp.Y];
                        if (geometryOffset) {
                            coord[0] -= geometryOffset[0];
                            coord[1] -= geometryOffset[1];
                        }
                        return coord;
                    })
            },
            coverageId: coverageId,
            dimensionSubsets: dimensionSubsets?.slice()
        } as AdamWcsVerticalProfile;
    }
}
