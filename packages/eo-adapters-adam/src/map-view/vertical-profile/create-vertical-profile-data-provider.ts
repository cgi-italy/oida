import debounce from 'lodash/debounce';

import { AxiosInstanceWithCancellation } from '@oidajs/core';
import { DatasetVerticalProfileViz, VerticalProfileItemProps, RasterBandModeSingle } from '@oidajs/eo-mobx';

import { createGeoTiffLoader, getCoverageWcsParams } from '../../utils';
import { AdamWcsDatasetConfig, AdamDatasetSingleBandCoverage, isMultiBandCoverage } from '../../adam-dataset-config';
import { AdamDatasetFactoryConfig } from '../../get-adam-dataset-factory';
import { AdamWcsVerticalProfileDataProvider, AdamWcsVerticalProfilesRequest } from './adam-wcs-vertical-profile-data-provider';

export const createVerticalProfileDataProvider = (
    factoryConfig: AdamDatasetFactoryConfig,
    datasetConfig: AdamWcsDatasetConfig,
    axiosInstance: AxiosInstanceWithCancellation
) => {
    const geotiffLoader = createGeoTiffLoader({
        axiosInstance,
        rotateImage: true
    });

    const wcsVerticalProfileProvider = new AdamWcsVerticalProfileDataProvider({
        serviceUrl: factoryConfig.wcsServiceUrl,
        axiosInstance: axiosInstance
    });

    const debouncedProfileGetter = debounce((request: AdamWcsVerticalProfilesRequest, resolve, reject) => {
        wcsVerticalProfileProvider.getProfiles(request).then(
            (profiles) => {
                Promise.all(
                    profiles.map((profile) => {
                        return geotiffLoader.load({ url: profile.dataUrl }).then((imageData) => {
                            const verticalProfile = {
                                id: profile.id,
                                geometry: {
                                    bottomCoords: profile.track,
                                    height: profile.metadata.VERTICAL_MAX,
                                    minHeight: 0
                                },
                                style: {
                                    fillImage: imageData as string
                                }
                            };
                            return verticalProfile;
                        });
                    })
                ).then(
                    (profiles) => {
                        resolve(profiles);
                    },
                    (error) => {
                        reject(error);
                    }
                );
            },
            (error) => {
                reject(error);
            }
        );
    }, 10);

    const load = (vProfileViz: DatasetVerticalProfileViz) => {
        const subsets: string[] = [];
        const bandMode = vProfileViz.bandMode;
        if (!(bandMode.value instanceof RasterBandModeSingle)) {
            return Promise.reject(new Error('Unsupported band mode'));
        }
        const wcsCoverageParams = getCoverageWcsParams(datasetConfig, vProfileViz.dimensions, bandMode);
        if (!wcsCoverageParams) {
            return Promise.reject(new Error('Unsupported coverage'));
        }
        if (wcsCoverageParams.bandSubset) {
            subsets.push(wcsCoverageParams.bandSubset);
        }
        subsets.push(...wcsCoverageParams.dimensionSubsets);

        const timeFilter = datasetConfig.fixedTime instanceof Date ? datasetConfig.fixedTime : vProfileViz.dataset.toi;
        if (!timeFilter) {
            return Promise.reject(new Error('No time selected'));
        }
        return new Promise<VerticalProfileItemProps[]>((resolve, reject) => {
            debouncedProfileGetter(
                {
                    wcsCoverage: wcsCoverageParams.coverageId,
                    timeFilter: timeFilter,
                    dimensionSubsets: subsets,
                    geometryOffset: datasetConfig.requestExtentOffset
                },
                resolve,
                reject
            );
        });
    };

    const verticalProfileProvider = {
        getProfiles: load,
        getProfileData: (profileId: string) => {
            return wcsVerticalProfileProvider
                .getProfileDataUrl({
                    profileId: profileId
                })
                .then((dataUrl) => {
                    return geotiffLoader.load({ url: dataUrl }).then((imageData) => {
                        return imageData as string;
                    });
                });
        }
    };

    return {
        wcsProvider: wcsVerticalProfileProvider,
        verticalProfileProvider,
        geotiffLoader
    };
};
