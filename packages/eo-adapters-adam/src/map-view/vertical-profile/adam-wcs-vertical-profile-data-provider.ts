import {
    AxiosInstanceWithCancellation, createAxiosInstance, DateRangeValue
} from '@oidajs/core';

import { AdamServiceParamsSerializer, getWcsTimeFilterSubset } from '../../utils';

export type AdamWcsVerticalProfileDataProviderConfig = {
    serviceUrl: string;
    variables: Array<{
        id: string,
        wcsCoverage: string
        geometryOffset?: number[]
    }>;
    axiosInstance?: AxiosInstanceWithCancellation
};

export type AdamWcsVerticalProfile = {
    time: Date,
    dimensions: number[],
    gcps: Array<{
        P: number,
        L: number,
        X: number,
        Y: number,
        Z: number
    }>
    track: GeoJSON.LineString,
    metadata: {
        HORIZONTAL_LENGTH: number,
        HORIZONTAL_RES: number,
        UNIT: string,
        VERTICAL_MAX: number,
        VERTICAL_MIN: number,
        VERTICAL_RES: number
    },
    noDataValue: number
};

export type AdamWcsVerticalProfilesRequest = {
    variable: string,
    timeFilter?: Date | DateRangeValue,
    scale?: number,
    xSubset?: number[],
    ySubset?: number[]
};

export type AdamWcsVerticalProfileDataRequest = {
    profileId: string,
    xSubset?: number[],
    ySubset?: number[]
};

export type AdamWcsVerticalProfileSeriesRequest = {
    profileId: string,
    targetSamples?: number,
    series: {
        direction: 'horizontal' | 'vertical',
        index: number
    }
};

export class AdamWcsVerticalProfileDataProvider {

    protected config_: AdamWcsVerticalProfileDataProviderConfig;
    protected coverageProfiles_: {
        [coverageId: string] : Promise<{[profileId: string]: AdamWcsVerticalProfile}>
    };

    protected cachedProfiles_: {
        [profileId: string]: AdamWcsVerticalProfile
    };

    protected axiosInstance_: AxiosInstanceWithCancellation;

    constructor(config: AdamWcsVerticalProfileDataProviderConfig) {
        this.config_ = config;
        this.axiosInstance_ = config.axiosInstance || createAxiosInstance();
        this.coverageProfiles_ = {};
        this.cachedProfiles_ = {};
    }

    getProfiles(request: AdamWcsVerticalProfilesRequest) {

        let variable = this.getVariableConfig_(request.variable);
        if (!variable) {
            return Promise.reject(`AdamWcsVerticalProfileDataProvider: no config provided for variable ${request.variable}`);
        }

        let wcsParams: any = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            coverageId: variable.wcsCoverage,
            format: 'image/tiff'
        };

        let subset: string[] = [];

        if (request.xSubset) {
            subset.push(`x(${request.xSubset[0]},${request.xSubset[1]}`);
        }
        if (request.ySubset) {
            subset.push(`y(${request.ySubset[0]},${request.ySubset[1]}`);
        }

        return this.getProfilesMetadata_(variable, request.timeFilter).then((profiles) => {
            return Object.keys(profiles).map((profileId) => {

                let profileInfo = profiles[profileId];
                let timeSubset = `unix(${profileInfo.time.toISOString()})`;

                let desiredHorizontalRes = 4000;
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

        let coverageId = this.getCoverageFromProfileId_(request.profileId);

        let wcsParams: any = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            coverageId: coverageId,
            format: 'image/tiff'
        };

        let subset: string[] = [];

        if (request.xSubset) {
            subset.push(`x(${request.xSubset[0]},${request.xSubset[1]}`);
        }
        if (request.ySubset) {
            subset.push(`y(${request.ySubset[0]},${request.ySubset[1]}`);
        }

        return this.getProfileMetadata(request.profileId).then(profile => {

            let timeSubset = `unix(${profile.time.toISOString()})`;

            let desiredHorizontalRes = 4000;
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
        let coverageId = this.getCoverageFromProfileId_(request.profileId);

        let wcsParams: any = {
            service: 'WCS',
            request: 'GetCoverage',
            version: '2.0.0',
            coverageId: coverageId,
            format: 'application/json'
        };

        let subset: string[] = [];

        let index = Math.round(request.series.index);

        return this.getProfileMetadata(request.profileId).then((profile) => {

            let targetSamples = request.targetSamples || 100;

            if (request.series.direction === 'horizontal') {
                subset.push(`x(${index},${index + 1})`);
                wcsParams.scale = targetSamples / profile.dimensions[1];
            } else {
                subset.push(`y(${index},${index + 1})`);
                wcsParams.scale = targetSamples / profile.dimensions[0];
            }

            subset.push(`unix(${profile.time.toISOString()})`);

            return this.axiosInstance_.cancelableRequest({
                url: this.config_.serviceUrl,
                method: 'GET',
                params: {
                    ...wcsParams,
                    subset: subset
                },
                paramsSerializer: AdamServiceParamsSerializer
            }).then((response) => {
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
                    data: series.filter(value => value.y !== profile.noDataValue),
                    subsample: wcsParams.scale || 1
                };
            });
        });
    }

    getProfileMetadata(profileId: string) {
        return Promise.resolve(this.cachedProfiles_[profileId]);

    }

    protected getVariableConfig_(variableId: string) {
        return this.config_.variables.find(variable => variable.id === variableId);
    }

    protected getHeightFromVerticalCoord_(profile: AdamWcsVerticalProfile, coordIndex: number, scale?: number) {
        let absoluteIdx = coordIndex / (scale || 1);
        return profile.metadata.VERTICAL_MIN +
            absoluteIdx / profile.dimensions[0] * (profile.metadata.VERTICAL_MAX - profile.metadata.VERTICAL_MIN);
    }

    protected getDistanceFromHorizontalCoord_(profile: AdamWcsVerticalProfile, coordIndex: number, scale?: number) {
        let absoluteIdx = coordIndex / (scale || 1);
        return absoluteIdx * profile.metadata.HORIZONTAL_RES;
    }

    protected getProfilesMetadata_(variableConfig, timeFilter?: Date | DateRangeValue) {

        let {wcsCoverage: coverageId, geometryOffset} = variableConfig;

        let timeFilterSubset = getWcsTimeFilterSubset(timeFilter);

        let wcsParams: any = {
            service: 'WCS',
            request: 'GetInfo',
            version: '2.0.0',
            subset: timeFilterSubset ? [timeFilterSubset] : [],
            coverageId: coverageId
        };

        return this.axiosInstance_.cancelableRequest({
            url: this.config_.serviceUrl,
            method: 'GET',
            params: wcsParams,
            paramsSerializer: AdamServiceParamsSerializer
        }).then((response) => {
            let profiles: AdamWcsVerticalProfile[] = response.data.prods.map(prod => this.parseProfileMetadata_(prod, geometryOffset));
            let profilesMap: {[profileId: string]: AdamWcsVerticalProfile} = profiles.reduce((profileMap, profile) => {
                return {
                    ...profileMap,
                    [`${coverageId}_${profile.time.getTime()}`]: profile
                };
            }, {});

            this.cachedProfiles_ = {
                ...this.cachedProfiles_,
                ...profilesMap
            };

            return profilesMap;
        });
    }

    protected parseProfileMetadata_(data, geometryOffset?) {
        return {
            time: new Date(data.time * 1000),
            dimensions: data.dimentions,
            gcps: data.gcps,
            metadata: {
                HORIZONTAL_LENGTH: parseFloat(data.metadata.HORIZONTAL_LEGHT),
                HORIZONTAL_RES: parseFloat(data.metadata.HORIZONTAL_RES),
                UNIT: data.UNIT,
                VERTICAL_MAX: parseFloat(data.metadata.VERTICAL_MAX),
                VERTICAL_MIN: parseFloat(data.metadata.VERTICAL_MIN),
                VERTICAL_RES: parseFloat(data.metadata.VERTICAL_RES)
            },
            noDataValue: data.bands[0].nodata,
            track: {
                type: 'LineString',
                coordinates: data.gcps.sort((a, b) => a.L - b.L).map(gcp => {
                    let coord = [gcp.X, gcp.Y];
                    if (geometryOffset) {
                        coord[0] -= geometryOffset[0];
                        coord[1] -= geometryOffset[1];
                    }
                    return coord;
                })
            }
        } as AdamWcsVerticalProfile;
    }

    protected getCoverageFromProfileId_(profileId: string) {
        return profileId.substr(0, profileId.lastIndexOf('_'));
    }
}
